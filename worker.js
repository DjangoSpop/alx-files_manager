import { Queue } from 'bull';
import imageThumbnail from 'image-thumbnail';
import fs from 'fs';
import path from 'path';
import { ObjectId } from 'mongodb';
import dbClient from './utils/db';

const fileQueue = new Queue('fileQueue');

fileQueue.process(async (job) => {
  try {
    const { fileId, userId } = job.data;

    if (!fileId) throw new Error('Missing fileId');
    if (!userId) throw new Error('Missing userId');

    const file = await dbClient.db
      .collection('files')
      .findOne({ _id: ObjectId(fileId), userId: ObjectId(userId) });

    if (!file) throw new Error('File not found');

    const basePath = process.env.FOLDER_PATH || '/tmp/files_manager';
    const sizes = [500, 250, 100];
    const thumbnailPromises = sizes.map(async (size) => {
      const thumbnailPath = `${file.localPath}_${size}`;
      const thumbnail = await imageThumbnail(file.localPath, { width: size });
      await fs.promises.writeFile(thumbnailPath, thumbnail);
    });

    await Promise.all(thumbnailPromises);
  } catch (error) {
    console.error('Error processing job', error);
    throw error;
  }
});
