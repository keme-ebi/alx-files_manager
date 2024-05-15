import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AuthController {
  static async getConnect(req, res) {
    const auth = req.header('Authorization');
    if (!auth || !auth.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const encoded = auth.split(' ')[1];
    const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
    const [email, pwd] = decoded.split(':');

    const hashed = sha1(pwd);
    const users = dbClient.db.collection('users');
    const user = await users.findOne({ email, password: hashed });
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const token = uuidv4();
    const key = `auth_${token}`;

    await redisClient.set(key, user._id.toString(), 24 * 60 * 60);
    return res.status(200).json({ token });
  }

  static async getDisconnect(req, res) {
    const token = req.header('X-Token');
    const key = `auth_${token}`;
    const user = await redisClient.get(key);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    await redisClient.del(key);
    return res.status(204).send();
  }
}

module.exports = AuthController;
