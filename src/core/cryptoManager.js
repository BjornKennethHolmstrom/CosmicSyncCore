import crypto from 'crypto';

class CryptoManager {
  async encrypt(data, key) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return { iv: iv.toString('hex'), encryptedData: encrypted, authTag: authTag.toString('hex') };
  }

  async decrypt(encryptedData, key, iv, authTag) {
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  generateKey() {
    return crypto.randomBytes(32);
  }
}

export default new CryptoManager();
