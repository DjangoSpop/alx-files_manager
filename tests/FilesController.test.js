import fs from 'fs/promises';
import Queue from 'bull';
import FilesController from '../controllers/FilesController';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

jest.mock('../utils/redis');
jest.mock('../utils/db');
jest.mock('fs/promises');
jest.mock('bull');

describe('FilesController', () => {
  describe('postUpload', () => {
    it('should return 401 if user is not authenticated', async () => {
      redisClient.get.mockResolvedValue(null);

      const req = {
        headers: { 'x-token': 'mockToken' },
        body: { name: 'file.txt', type: 'text/plain', data: 'dGVzdCBkYXRh' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await FilesController.postUpload(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    it('should return 400 if required fields are missing', async () => {
      redisClient.get.mockResolvedValue('mockUserId');

      const req = {
        headers: { 'x-token': 'mockToken' },
        body: { name: 'file.txt', type: 'text/plain' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await FilesController.postUpload(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing name, type, or data' });
    });

    it('should upload the file and return 201 if all data is provided', async () => {
      redisClient.get.mockResolvedValue('mockUserId');
      dbClient.db.collection.mockResolvedValue({
        insertOne: jest.fn().mockResolvedValue({ insertedId: 'mockFileId', ops: [{ _id: 'mockFileId' }] }),
      });
      fs.writeFile.mockResolvedValue();
      Queue.mockImplementation(() => ({
        add: jest.fn(),
      }));

      const req = {
        headers: { 'x-token': 'mockToken' },
        body: { name: 'file.txt', type: 'text/plain', data: 'dGVzdCBkYXRh' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await FilesController.postUpload(req, res);

      expect(fs.writeFile).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ _id: 'mockFileId' });
    });

    it('should add a job to the file queue if the file is an image', async () => {
      redisClient.get.mockResolvedValue('mockUserId');
      dbClient.db.collection.mockResolvedValue({
        insertOne: jest.fn().mockResolvedValue({ insertedId: 'mockFileId', ops: [{ _id: 'mockFileId' }] }),
      });
      fs.writeFile.mockResolvedValue();
      const mockQueue = {
        add: jest.fn(),
      };
      Queue.mockImplementation(() => mockQueue);

      const req = {
        headers: { 'x-token': 'mockToken' },
        body: { name: 'image.jpg', type: 'image/jpeg', data: 'dGVzdCBkYXRh' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await FilesController.postUpload(req, res);

      expect(mockQueue.add).toHaveBeenCalledWith({ fileId: 'mockFileId', userId: 'mockUserId' });
    });
  });
});
