import sha1 from 'sha1';
import { ObjectID } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) return res.status(400).json({ error: 'Missing email' });

    if (!password) return res.status(400).json({ error: 'Missing password' });

    const users = dbClient.db.collection('users');
    const user = await users.findOne({ email });
    if (user) return res.status(400).json({ error: 'Already exists' });

    const hashed = sha1(password);
    const result = await users.insertOne({ email, password: hashed });
    return res.status(201).json({ id: result.insertedId, email });
  }

  static async getMe(req, res) {
    const token = req.header('X-Token');
    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const users = dbClient.db.collection('users');
    const obId = new ObjectID(userId);
    const user = await users.findOne({ _id: obId });
    if (!user) return res.status(401).json({ error: 'Unathorized' });

    return res.status(200).json({ id: userId, email: user.email });
  }
}

module.exports = UsersController;
