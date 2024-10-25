// src/api/restApi.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import dataAccessLayer from '../data/dataAccessLayer.js';
import SyncManager from '../core/syncManager.js';
import DatabaseManager from '../data/DatabaseManager.js';  // Added
import config from '../config.js';  // Added
import auth from '../core/auth.js';
import { CID } from 'multiformats/cid';
import logger from '../core/logger.js';
import errorMiddleware from '../core/errorMiddleware.js';
import { NotFoundError, BadRequestError } from '../core/errors.js';
import monitoring from '../core/monitoring.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const router = express.Router();
const upload = multer({ memory: true });

// Initialize DatabaseManager and SyncManager
const dbManager = new DatabaseManager(config.databasePath);
const syncManager = new SyncManager(dbManager);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../public')));

const apiVersion = '/api/v1';

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
dbManager.initialize().then(() => {
  dbManager.initializeTables();
}).catch(error => {
  logger.error('Failed to initialize database:', error);
});

export default app;
