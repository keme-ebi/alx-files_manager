import sha1 from 'sha1';
import dbClient from '../utils/db';

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) return res.status(400).json({ error: 'Missing email' });

    if (!password) return res.status(400).json({ error: 'Missing password' });

    const user = dbClient.db.collection('users');
    const userExists = await user.findOne({ email });
    if (userExists) return res.status(400).json({ error: 'Already exists' });

    const hashed = sha1(password);
    const result = await user.insertOne({ email, password: hashed });
    return res.status(201).json({ id: result.insertedId, email });
  }
}

module.exports = UsersController;
