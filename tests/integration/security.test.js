import supertest from 'supertest';
import app from '../../src/api/restApi.js';
import cryptoManager from '../../src/core/cryptoManager.js';

const request = supertest(app);

describe('Security Features', () => {
  test('Authentication', async () => {
    const loginResponse = await request
      .post('/api/v1/login')
      .send({ userId: 'testUser' });
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toHaveProperty('token');

    const authToken = loginResponse.body.token;

    // Test authenticated request
    const authedResponse = await request
      .get('/api/v1/data/testKey')
      .set('Authorization', `Bearer ${authToken}`);
    expect(authedResponse.status).not.toBe(401);

    // Test unauthenticated request
    const unauthedResponse = await request.get('/api/v1/data/testKey');
    expect(unauthedResponse.status).toBe(401);
  });

  test('Encryption', async () => {
    const testData = 'Sensitive information';
    const keyId = 'testKeyId';

    // Generate a key
    const key = await cryptoManager.generateKey();
    await cryptoManager.storeKey(keyId, key);

    // Encrypt data
    const encryptedData = await cryptoManager.encrypt(testData, keyId);
    expect(encryptedData).not.toBe(testData);

    // Decrypt data
    const decryptedData = await cryptoManager.decrypt(encryptedData.encryptedData, keyId, encryptedData.iv, encryptedData.authTag);
    expect(decryptedData).toBe(testData);
  });
});
