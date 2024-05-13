import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.client = createClient();

    this.client.on('error', (err) => {
      console.log(`Redis client not connected to the server: ${err}`);
    });
  }

  isAlive() {
    return this.client.connected;
  }

  async get(key) {
    const getValue = promisify(this.client.get).bind(this.client);
    const value = await getValue(key);
    return value;
  }

  async set(key, value, duration) {
    const setKeyValue = promisify(this.client.set).bind(this.client);
    await setKeyValue(key, value, 'EX', duration);
  }

  async del(key) {
    const delValue = promisify(this.client.del).bind(this.client);
    await delValue(key);
  }
}

const redisClient = new RedisClient();

module.exports = redisClient;
