// tests/integration/api-extended.test.js

import request from 'supertest';
import app from '../../src/api/restApi.js';
import { setupTestDatabase } from '../helpers/dbSetup.helper.js';
import DatabaseManager from '../../src/data/DatabaseManager.js';

describe('Core API Integration Tests', () => {
  let dbManager;
  let authToken;

  beforeAll(async () => {
    dbManager = await setupTestDatabase();
    // Get auth token for protected endpoints
    const loginResponse = await request(app)
      .post('/api/v1/login')
      .send({ userId: 'testUser123' });
    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    await dbManager.close();
  });

  describe('Authentication Endpoints', () => {
    describe('POST /api/v1/auth/login', () => {
      it('should return JWT token for valid credentials', async () => {
        const response = await request(app)
          .post('/api/v1/auth/login')
          .send({
            email: 'test@example.com',
            password: 'validPassword123'
          });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
      });

      it('should return 401 for invalid credentials', async () => {
        const response = await request(app)
          .post('/api/v1/auth/login')
          .send({
            email: 'test@example.com',
            password: 'wrongPassword'
          });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error');
      });
    });
  });

  describe('User Management Endpoints', () => {
    describe('POST /api/v1/users', () => {
      it('should create a new user', async () => {
        const response = await request(app)
          .post('/api/v1/users')
          .send({
            email: 'newuser@example.com',
            username: 'newuser',
            password: 'securePass123'
          });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('userId');
      });

      it('should return 400 for invalid user data', async () => {
        const response = await request(app)
          .post('/api/v1/users')
          .send({
            email: 'invalid-email',
            username: '',
            password: '123' // too short
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
      });
    });

    describe('GET /api/v1/users/:id', () => {
      it('should retrieve user profile', async () => {
        const response = await request(app)
          .get('/api/v1/users/testUser123')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('username');
        expect(response.body).toHaveProperty('email');
      });

      it('should return 404 for non-existent user', async () => {
        const response = await request(app)
          .get('/api/v1/users/nonexistent')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(404);
      });
    });

    describe('PUT /api/v1/users/:id', () => {
      it('should update user profile', async () => {
        const response = await request(app)
          .put('/api/v1/users/testUser123')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            username: 'updatedUsername'
          });

        expect(response.status).toBe(200);
        expect(response.body.username).toBe('updatedUsername');
      });
    });
  });

  describe('Data Operations', () => {
    describe('POST /api/v1/data', () => {
      it('should create new data entry', async () => {
        const response = await request(app)
          .post('/api/v1/data')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            key: 'testKey',
            value: { test: 'data' }
          });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('message', 'Data synced successfully');
      });
    });

    describe('GET /api/v1/data/:key', () => {
      it('should retrieve data by key', async () => {
        const response = await request(app)
          .get('/api/v1/data/testKey')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveProperty('test', 'data');
      });
    });
  });

  describe('P2P Operations', () => {
    describe('GET /api/v1/peers', () => {
      it('should list active peers', async () => {
        const response = await request(app)
          .get('/api/v1/peers')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.peers)).toBe(true);
      });
    });

    describe('POST /api/v1/peers/connect', () => {
      it('should attempt to connect to a peer', async () => {
        const response = await request(app)
          .post('/api/v1/peers/connect')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            peerId: 'QmTest123'
          });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('connected');
      });
    });
  });

  describe('API Rate Limiting', () => {
    it('should limit requests after threshold is reached', async () => {
      // Make multiple requests in quick succession
      const requests = Array(11).fill().map(() => 
        request(app)
          .get('/api/v1/users/testUser123')
          .set('Authorization', `Bearer ${authToken}`)
      );

      const responses = await Promise.all(requests);
      const lastResponse = responses[responses.length - 1];

      expect(lastResponse.status).toBe(429);
      expect(lastResponse.body).toHaveProperty('error', 'Too many requests');
    });
  });
});
