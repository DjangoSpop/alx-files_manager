// import { ObjectId } from 'mongodb';
import fs from 'fs';
import mime from 'mime-types';
import dbClient from './utils/db';
import redisClient from './utils/redis';
import Queue from 'bull';
import imageThumbnail from 'image-thumbnail';

const fileQueue = new Queue('fileQueue');

class FilesController {
  // ...implementation of file controller logic
    static async postUpload(req, res) {
    const token = req.headers['x-token'];
    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

 // ...rest of your file upload logic, including thumbnail creation

       if (type === 'image') {
      const jobData = { fileId: newFile._id, userId: userId };
      fileQueue.add(jobData);
    }

    return res.status(201).json(newFile);
  }
  }

export default FilesController;
