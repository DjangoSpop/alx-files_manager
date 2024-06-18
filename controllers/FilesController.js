import { ObjectId } from 'mongodb';
import fs from 'fs/promises';
import mime from 'mime-types';
import { Queue } from 'bull';
import imageThumbnail from 'image-thumbnail';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const fileQueue = new Queue('fileQueue');

class FilesController {
  static async postUpload(req, res) {
    try {
      const token = req.headers['x-token'];
      const key = `auth_${token}`;
      const userId = await redisClient.get(key);

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { name, type, data } = req.body;

      if (!name || !type || !data) {
        return res.status(400).json({ error: 'Missing name, type, or data' });
      }

      const filePath = `/tmp/${name}`;
      await fs.writeFile(filePath, Buffer.from(data, 'base64'));

      const newFile = {
        userId: ObjectId(userId),
        name,
        type,
        localPath: filePath,
      };

      const result = await dbClient.db.collection('files').insertOne(newFile);

      if (type === 'image') {
        const jobData = { fileId: result.insertedId, userId: userId };
        fileQueue.add(jobData);
      }

      return res.status(201).json(result.ops[0]);
    } catch (err) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // Add other file-related methods here...
}

export default FilesController;
