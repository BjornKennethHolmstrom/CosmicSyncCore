// src/core/cryptoManager.js
import crypto from 'crypto';
import localStorageAdapter from '../data/localStorageAdapter.js';

class CryptoManager {
  constructor() {
    this.keyPrefix = 'crypto_key_';
  }

  async generateKey() {
    return crypto.randomBytes(32);
  }

  async storeKey(keyId, key) {
    if (!key || !Buffer.isBuffer(key)) {
      throw new Error('Invalid key provided for storage');
    }
    await localStorageAdapter.set(`${this.keyPrefix}${keyId}`, key.toString('hex'));
  }

  async getKey(keyId) {
    try {
      const keyHex = await localStorageAdapter.get(`${this.keyPrefix}${keyId}`);
      if (!keyHex) {
        return null;
      }
      return Buffer.from(keyHex, 'hex');
    } catch (error) {
      console.error('Error retrieving key:', error);
      return null;
    }
  }

  async rotateKey(oldKeyId, newKeyId) {
    const newKey = await this.generateKey();
    await this.storeKey(newKeyId, newKey);
    await localStorageAdapter.set(`${this.keyPrefix}${oldKeyId}_rotated_to`, newKeyId);
  }

  async encrypt(data, keyId) {
    const key = await this.getKey(keyId);
    if (!key) {
      throw new Error(`No key found for ID: ${keyId}`);
    }
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return { 
      iv: iv.toString('hex'), 
      encryptedData: encrypted, 
      authTag: authTag.toString('hex') 
    };
  }

  async decrypt(encryptedData, keyId, iv, authTag) {
    const key = await this.getKey(keyId);
    if (!key) {
      throw new Error(`No key found for ID: ${keyId}`);
    }
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm', 
      key, 
      Buffer.from(iv, 'hex')
    );
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  async sign(data, keyId) {
    const key = await this.getKey(keyId);
    if (!key) {
      throw new Error(`No key found for ID: ${keyId}`);
    }
    const sign = crypto.createSign('SHA256');
    sign.update(data);
    return sign.sign(key, 'hex');
  }

  async verify(data, signature, keyId) {
    const key = await this.getKey(keyId);
    if (!key) {
      throw new Error(`No key found for ID: ${keyId}`);
    }
    const verify = crypto.createVerify('SHA256');
    verify.update(data);
    return verify.verify(key, signature, 'hex');
  }

  // Utility method to check if a key exists
  async hasKey(keyId) {
    const key = await this.getKey(keyId);
    return key !== null;
  }
}

export default new CryptoManager();
