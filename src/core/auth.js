import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { promisify } from 'util';

const sign = promisify(jwt.sign);
const verify = promisify(jwt.verify);

class Auth {
  constructor() {
    this.secretKey = crypto.randomBytes(64).toString('hex');
  }

  async generateToken(userId) {
    return sign({ userId }, this.secretKey, { expiresIn: '24h' });
  }

  async verifyToken(token) {
    try {
      const decoded = await verify(token, this.secretKey);
      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  middleware() {
    return async (req, res, next) => {
      const token = req.headers['authorization']?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }
      try {
        const decoded = await this.verifyToken(token);
        req.userId = decoded.userId;
        next();
      } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
      }
    };
  }
}

export default new Auth();
