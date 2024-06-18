import { createClient } from 'redis';

class RedisClient {
  constructor() {
    this.client = createClient();
    this.client.on('error', (err) => console.error('Redis client error', err));
    this.client.connect();
  }

  isAlive() {
    return this.client.isReady;
  }

  async get(key) {
    return this.client.get(key);
  }

  async set(key, value, duration) {
    await this.client.set(key, value);
    await this.client.expire(key, duration);
  }

  async del(key) {
    await this.client.del(key);
  }
}

const redisClient = new RedisClient();
export default redisClient;
