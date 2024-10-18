// tests/integration/api.test.js
import supertest from 'supertest';
import app from '../../src/api/restApi.js';
import localStorageAdapter from '../../src/data/localStorageAdapter.js';
import logger from '../../src/core/logger.js';
import { jest, describe, beforeAll, afterAll, test, expect } from '@jest/globals';

const request = supertest(app);

describe('API Endpoints', () => {
  let authToken;

  afterAll(async () => {
    await localStorageAdapter.close();
    // If GunDB has a close method, call it here
    // await gunAdapter.close();
  });

  beforeAll(async () => {
    const loginResponse = await request
      .post('/api/v1/login')
      .send({ userId: 'testUser' });
    authToken = loginResponse.body.token;
  });

  test('Health check endpoint', async () => {
    const response = await request.get('/api/v1/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'UP');
  });

  test('Data operations', async () => {
    const testData = { key: 'testKey', value: 'testValue' };

    // Store data
    const storeResponse = await request
      .post('/api/v1/data')
      .set('Authorization', `Bearer ${authToken}`)
      .send(testData);
    expect(storeResponse.status).toBe(200);

    // Add a small delay to ensure data is stored
    await new Promise(resolve => setTimeout(resolve, 100));

    // Retrieve data
    const retrieveResponse = await request
      .get(`/api/v1/data/${testData.key}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(retrieveResponse.status).toBe(200);
    expect(retrieveResponse.body.data).toBe(testData.value);
  });

  test('File operations', async () => {
    const testFileContent = Buffer.from('Test file content');

    // Upload file
    const uploadResponse = await request
      .post('/api/v1/file')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', testFileContent, 'test.txt');
    expect(uploadResponse.status).toBe(200);
    expect(uploadResponse.body).toHaveProperty('cid');

    // Add a small delay to ensure file is stored
    await new Promise(resolve => setTimeout(resolve, 100));

    // Retrieve file
    const retrieveResponse = await request
      .get(`/api/v1/file/${uploadResponse.body.cid}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(retrieveResponse.status).toBe(200);
    expect(retrieveResponse.text).toBe(testFileContent.toString());
  });
});
