import redis from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.client = redis.createClient();
    this.client.on('error', (error) => {
      console.error(`Redis client error: ${error}`);
    });

    // Promisify Redis commands
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setexAsync = promisify(this.client.setex).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
  }

  isAlive() {
    return this.client.connected;
  }

  async get(key) {
    return this.getAsync(key);
  }

  async set(key, value, duration) {
    return this.setexAsync(key, duration, value);
  }

  async del(key) {
    return this.delAsync(key);
  }

  async connect() {
    return new Promise((resolve) => {
      this.client.on('connect', () => {
        console.log('Redis client connected');
        resolve();
      });
    });
  }
}

const redisClient = new RedisClient();
export default redisClient;
