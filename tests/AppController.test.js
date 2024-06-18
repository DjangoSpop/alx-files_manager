import AppController from '../controllers/AppController';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

jest.mock('../utils/redis');
jest.mock('../utils/db');

describe('AppController', () => {
  describe('getStatus', () => {
    it('should return 200 when both Redis and DB are alive', async () => {
      redisClient.isAlive.mockResolvedValue(true);
      dbClient.isAlive.mockResolvedValue(true);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await AppController.getStatus({}, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ redis: true, db: true });
    });

    it('should return 500 when either Redis or DB is not alive', async () => {
      redisClient.isAlive.mockResolvedValue(false);
      dbClient.isAlive.mockResolvedValue(true);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await AppController.getStatus({}, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
    });
  });

  describe('getStats', () => {
    it('should return the correct number of users and files', async () => {
      dbClient.nbUsers.mockResolvedValue(10);
      dbClient.nbFiles.mockResolvedValue(20);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await AppController.getStats({}, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ users: 10, files: 20 });
    });

    it('should return 500 if an error occurs', async () => {
      dbClient.nbUsers.mockRejectedValue(new Error('Database error'));

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await AppController.getStats({}, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
    });
  });
});
