import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppController {
  static getStatus(req, res) {
    const rdCl = redisClient.isAlive();
    const dbCl = dbClient.isAlive();

    res.status(200).json({ redis: rdCl, db: dbCl });
  }

  static async getStats(req, res) {
    const numUsers = await dbClient.nbUsers();
    const numFiles = await dbClient.nbFiles();

    res.status(200).json({ users: numUsers, files: numFiles });
  }
}

module.exports = AppController;
