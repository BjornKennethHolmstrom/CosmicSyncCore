// src/api/restApi.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestError, UnauthorizedError, NotFoundError } from '../core/errors.js';
import dataAccessLayer from '../data/dataAccessLayer.js';
import SyncManager from '../core/syncManager.js';
import DatabaseManager from '../data/DatabaseManager.js';  // Added
import config from '../config.js';  // Added
import auth from '../core/auth.js';
import { CID } from 'multiformats/cid';
import logger from '../core/logger.js';
import errorMiddleware from '../core/errorMiddleware.js';
import monitoring from '../core/monitoring.js';
import { applyRateLimiters } from '../middleware/rateLimiter.js';
import { validateEmail, validatePassword, validateUsername, sanitizeUser } from '../utils/validation.js';
import { setupSwagger, validateApiSpec, swaggerDocument } from './swagger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const router = express.Router();
const upload = multer({ memory: true });

// Apply rate limiters to routes
applyRateLimiters(router);

// Initialize DatabaseManager
const dbManager = new DatabaseManager(config.databasePath);

// Initialize database before setting up routes
await dbManager.initialize().catch(error => {
  logger.error('Failed to initialize database:', error);
  process.exit(1);
});

// Initialize SyncManager
const syncManager = new SyncManager(dbManager);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../public')));

const apiVersion = '/api/v1';

if (process.env.NODE_ENV !== 'production') {
  try {
    await setupSwagger(app);
    logger.info('Swagger documentation setup successfully');
  } catch (error) {
    logger.error('Failed to setup Swagger documentation:', error);
  }
}

// Base routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/dashboard.html'));
});

// API routes
router.get('/health', async (req, res) => {
  await monitoring.updateMetrics();
  const metrics = monitoring.getMetrics();
  const health = {
    status: 'UP',
    ...metrics,
  };
  res.json(health);
});

router.post('/login', async (req, res, next) => {
  try {
    const userId = req.body.userId;
    if (!userId) {
      throw new BadRequestError('User ID is required');
    }
    const token = await auth.generateToken(userId);
    res.json({ token });
  } catch (error) {
    next(error);
  }
});

router.post('/auth/register', async (req, res, next) => {
  try {
    logger.info('Registration request received:', { body: req.body });
    const { email, password, username } = req.body;

    // Basic validation
    if (!email || !password || !username) {
      logger.warn('Registration validation failed - missing fields');
      throw new BadRequestError('Email, password, and username are required');
    }

    // Validate email format
    if (!validateEmail(email)) {
      logger.warn('Registration validation failed - invalid email');
      throw new BadRequestError('Invalid email format');
    }

    // Create user
    const userId = uuidv4();
    logger.info('Creating user in database');
    
    await dbManager.createUser({
      id: userId,
      email,
      username,
      password: await auth.hashPassword(password),
      timestamp: Date.now()
    });

    logger.info('User created successfully');

    // Generate tokens instead of single token
    logger.debug('Generating tokens');
    const tokens = await auth.generateTokens(userId);
    logger.debug('Tokens generated successfully');

    // Return success response
    res.status(201).json({
      message: 'User registered successfully',
      userId,
      ...tokens  // This spreads accessToken, refreshToken, and expiresIn
    });

  } catch (error) {
    logger.error('Registration error:', error);
    next(error);
  }
});

router.post('/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    logger.debug('Login attempt:', { email });

    if (!email || !password) {
      throw new BadRequestError('Email and password are required');
    }

    // Get user from database
    const user = await dbManager.getUserByEmail(email);
    if (!user) {
      logger.debug('User not found:', { email });
      throw new UnauthorizedError('Invalid credentials');
    }

    // Log hash details for debugging
    logger.debug('Password verification:', { 
      hasStoredHash: !!user.password,
      storedHashLength: user.password?.length,
      providedPasswordLength: password.length
    });

    // Verify password
    const isValid = await auth.verifyPassword(password, user.password);
    logger.debug('Password verification result:', { isValid });

    if (!isValid) {
      logger.debug('Password verification failed');
      throw new UnauthorizedError('Invalid credentials');
    }

    // Generate tokens
    const tokens = await auth.generateTokens(user.id);
    logger.debug('Tokens generated successfully');

    // Return success response
    res.json({
      message: 'Login successful',
      userId: user.id,
      ...tokens
    });

  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
});

router.post('/auth/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      throw new BadRequestError('Refresh token is required');
    }

    // Check if token is invalidated
    const isInvalidated = await dbManager.isTokenInvalidated(refreshToken);
    if (isInvalidated) {
      throw new UnauthorizedError('Refresh token has been invalidated');
    }

    // Generate new access token
    const tokens = await auth.refreshAccessToken(refreshToken);

    // Update session last used timestamp
    const session = await dbManager.getSessionByRefreshToken(refreshToken);
    if (session) {
      await dbManager.updateSessionUsage(session.id);
    }

    res.json(tokens);

  } catch (error) {
    logger.error('Token refresh error:', error);
    next(error);
  }
});

router.post('/auth/logout', auth.middleware(), async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const refreshToken = req.body.refreshToken;

    // Invalidate access token
    auth.invalidateToken(token);

    // If refresh token provided, invalidate it and end session
    if (refreshToken) {
      const session = await dbManager.getSessionByRefreshToken(refreshToken);
      if (session) {
        await dbManager.invalidateSession(session.id, 'logout');
      }

      await dbManager.addInvalidatedToken({
        token: refreshToken,
        userId: req.userId,
        reason: 'logout',
        expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // Keep for 7 days
      });
    }

    // Log logout event
    await dbManager.logAuthEvent({
      userId: req.userId,
      eventType: 'logout',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({ message: 'Logged out successfully' });

  } catch (error) {
    logger.error('Logout error:', error);
    next(error);
  }
});

// Password reset endpoints
router.post('/auth/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      throw new BadRequestError('Email is required');
    }

    const user = await dbManager.getUserByEmail(email);
    if (!user) {
      // Return success even if user not found to prevent email enumeration
      return res.json({ message: 'If an account exists, a password reset email will be sent' });
    }

    const resetToken = uuidv4();
    const resetExpiry = Date.now() + (1 * 60 * 60 * 1000); // 1 hour

    await dbManager.updateUser(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpiresAt: resetExpiry
    });

    // TODO: Send password reset email
    // For now, just log the token
    logger.info(`Password reset token for ${email}: ${resetToken}`);

    res.json({ message: 'If an account exists, a password reset email will be sent' });

  } catch (error) {
    logger.error('Password reset request error:', error);
    next(error);
  }
});

// Protected routes
router.use('/data', auth.middleware());
router.use('/file', auth.middleware());

router.post('/data', async (req, res, next) => {
  try {
    const { key, value } = req.body;
    if (!key || !value) {
      throw new BadRequestError('Key and value are required');
    }
    await dataAccessLayer.setData(key, value);
    await syncManager.syncData(key, value);
    logger.info(`Data synced successfully for key: ${key}`);
    res.json({ message: 'Data synced successfully' });
  } catch (error) {
    next(error);
  }
});

router.get('/data/:key', async (req, res, next) => {
  try {
    const data = await dataAccessLayer.getData(req.params.key);
    if (!data) {
      throw new NotFoundError(`Data not found for key: ${req.params.key}`);
    }
    res.json({ data: data.value || data });
  } catch (error) {
    next(error);
  }
});

router.post('/file', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new BadRequestError('No file uploaded');
    }
    const cid = await dataAccessLayer.addFile(req.file.buffer);
    logger.info(`File synced successfully with CID: ${cid}`);
    res.json({ cid: cid.toString() });
  } catch (error) {
    next(error);
  }
});

router.get('/file/:cid', async (req, res, next) => {
  try {
    const cid = CID.parse(req.params.cid);
    const fileData = await dataAccessLayer.getFile(cid.toString());
    if (!fileData) {
      throw new NotFoundError(`File not found for CID: ${req.params.cid}`);
    }
    
    if (Buffer.isBuffer(fileData)) {
      try {
        const jsonData = JSON.parse(fileData.toString());
        if (jsonData.type === 'Buffer' && Array.isArray(jsonData.data)) {
          const buffer = Buffer.from(jsonData.data);
          res.set('Content-Type', 'text/plain');
          res.send(buffer.toString());
        } else {
          res.set('Content-Type', 'application/json');
          res.send(jsonData);
        }
      } catch (parseError) {
        res.set('Content-Type', 'text/plain');
        res.send(fileData.toString());
      }
    } else {
      res.set('Content-Type', 'application/octet-stream');
      res.send(fileData);
    }
  } catch (error) {
    next(error);
  }
});

// Mount router with version prefix
app.use(apiVersion, router);

// Monitoring middleware
app.use((req, res, next) => {
  monitoring.incrementConnections();
  res.on('finish', () => {
    monitoring.decrementConnections();
  });
  next();
});

// Error handling middleware should be last
app.use(errorMiddleware);

// Initialize database when starting the server
if (process.env.NODE_ENV !== 'test') {
  dbManager.initialize().then(() => {
    logger.info('Production database initialized');
    return dbManager.initializeTables();
  }).catch(error => {
    logger.error('Failed to initialize database:', error);
    process.exit(1);  // Exit if database initialization fails
  });
}

export default app;
