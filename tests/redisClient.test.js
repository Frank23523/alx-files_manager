import redisClient from '../utils/redis';

describe('Redis Client', () => {
  beforeAll(async () => {
    await redisClient.connect();
  });

  afterAll(async () => {
    await redisClient.client.quit();
  });

  test('isAlive returns true when connected', () => {
    expect(redisClient.isAlive()).toBe(true);
  });

  test('set and get work correctly', async () => {
    await redisClient.set('testKey', 'testValue', 10);
    const value = await redisClient.get('testKey');
    expect(value).toBe('testValue');
  });

  test('del works correctly', async () => {
    await redisClient.set('testKey', 'testValue', 10);
    await redisClient.del('testKey');
    const value = await redisClient.get('testKey');
    expect(value).toBeNull();
  });
});
