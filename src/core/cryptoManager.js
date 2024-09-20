const crypto = require('crypto');

class CryptoManager {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.algorithm = 'aes-256-gcm';
    this.key = crypto.randomBytes(32);
    this.eventBus.emit('crypto:initialized');
  }

  encrypt(text) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag();
    this.eventBus.emit('crypto:encrypted', { length: text.length });
    return {
      iv: iv.toString('hex'),
      encryptedData: encrypted,
      tag: tag.toString('hex')
    };
  }

  decrypt(encryptedObj) {
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(encryptedObj.iv, 'hex')
    );
    decipher.setAuthTag(Buffer.from(encryptedObj.tag, 'hex'));
    let decrypted = decipher.update(encryptedObj.encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    this.eventBus.emit('crypto:decrypted', { length: decrypted.length });
    return decrypted;
  }
}

module.exports = CryptoManager;
