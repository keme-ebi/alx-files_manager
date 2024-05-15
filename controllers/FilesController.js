import { ObjectID } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class FilesController {
  static async retrieveUser(req) {
    const token = req.header('X-Token');
    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    // if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const users = dbClient.db.collection('users');
    const obId = new ObjectID(userId);
    const user = await users.findOne({ _id: obId });
    return user;
  }

  static async postUpload(req, res) {
    const user = await FilesController.retrieveUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const {
      name, type, parentId = 0,
      isPublic = false, data,
    } = req.body;

    if (!name) return res.status(400).json({ error: 'Missing name' });
    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }
    if (!data && type !== 'folder') {
      return res.status(400).json({ error: 'Missing data' });
    }

    const files = dbClient.db.collection('files');
    if (parentId) {
      const file = await files.findOne({ _id: ObjectID(parentId), userId: user._id });

      if (!file) return res.status(400).json({ error: 'Parent not found' });
      if (file.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    const newFile = {
      userId: user._id,
      name,
      type,
      isPublic,
      parentId,
    };

    if (type === 'file' || type === 'image') {
      const path = process.env.FOLDER_PATH || '/tmp/files_manager';
      await fs.mkdir(path, { recursive: true });
      const filename = `${path}/${uuidv4()}`;
      const buff = Buffer.from(data, 'base64');
      await fs.writeFile(filename, buff, 'utf-8');
      newFile.localPath = filename;
    }

    await files.insertOne(newFile);
    return res.status(201).send(newFile);
  }
}

module.exports = FilesController;