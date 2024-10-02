import request from 'supertest';
import app from '../server';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

describe('Endpoints', () => {
  let authToken;

  beforeAll(async () => {
    await dbClient.client.connect();
    await redisClient.connect();
  });

  afterAll(async () => {
    await dbClient.client.close();
    await redisClient.client.quit();
  });

  test('GET /status', async () => {
    const response = await request(app).get('/status');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('redis', true);
    expect(response.body).toHaveProperty('db', true);
  });

  test('GET /stats', async () => {
    const response = await request(app).get('/stats');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('users');
    expect(response.body).toHaveProperty('files');
  });

  test('POST /users', async () => {
    const response = await request(app)
      .post('/users')
      .send({ email: 'test@example.com', password: 'password123' });
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('email', 'test@example.com');
  });

  test('GET /connect', async () => {
    const credentials = Buffer.from('test@example.com:password123').toString(
      'base64',
    );
    const response = await request(app)
      .get('/connect')
      .set('Authorization', `Basic ${credentials}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('token');
    authToken = response.body.token;
  });

  test('GET /disconnect', async () => {
    const response = await request(app)
      .get('/disconnect')
      .set('X-Token', authToken);
    expect(response.statusCode).toBe(204);
  });

  test('GET /users/me', async () => {
    const response = await request(app)
      .get('/users/me')
      .set('X-Token', authToken);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('email');
  });

  test('POST /files', async () => {
    const response = await request(app)
      .post('/files')
      .set('X-Token', authToken)
      .send({
        name: 'testfile.txt',
        type: 'file',
        data: Buffer.from('Hello, world!').toString('base64'),
      });
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('name', 'testfile.txt');
  });

  test('GET /files/:id', async () => {
    const fileId = '66fc243574086a083459b3d3';
    const response = await request(app)
      .get(`/files/${fileId}`)
      .set('X-Token', authToken);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('id', fileId);
  });

  test('GET /files with pagination', async () => {
    const response = await request(app)
      .get('/files?page=0')
      .set('X-Token', authToken);
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeLessThanOrEqual(20);
  });

  test('PUT /files/:id/publish', async () => {
    const fileId = '66fc243574086a083459b3d3';
    const response = await request(app)
      .put(`/files/${fileId}/publish`)
      .set('X-Token', authToken);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('isPublic', true);
  });

  test('PUT /files/:id/unpublish', async () => {
    const fileId = '66fc243574086a083459b3d3';
    const response = await request(app)
      .put(`/files/${fileId}/unpublish`)
      .set('X-Token', authToken);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('isPublic', false);
  });

  test('GET /files/:id/data', async () => {
    const fileId = '66fc243574086a083459b3d3';
    const response = await request(app)
      .get(`/files/${fileId}/data`)
      .set('X-Token', authToken);
    expect(response.statusCode).toBe(200);
  });
});
