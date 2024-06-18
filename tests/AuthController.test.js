import AuthController from './AuthController';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

jest.mock('../utils/db');
jest.mock('../utils/redis');

describe('AuthController', () => {
  describe('getConnect', () => {
    it('should return 400 if email or password is missing', async () => {
      const req = { body: { email: 'test@example.com' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await AuthController.getConnect(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing email or password' });
    });

    it('should return 401 if user is not found or password is incorrect', async () => {
      const req = { body: { email: 'test@example.com', password: 'wrongpassword' } };
      dbClient.db.collection.mockResolvedValue({
        findOne: jest.fn().mockResolvedValue({ password: 'hashedpassword' }),
      });

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await AuthController.getConnect(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });

    it('should return a token if user is authenticated', async () => {
      const req = { body: { email: 'test@example.com', password: 'correctpassword' } };
      const mockUser = { _id: 'mockUserId', password: 'hashedpassword' };
      dbClient.db.collection.mockResolvedValue({
        findOne: jest.fn().mockResolvedValue(mockUser),
      });
      redisClient.setEx = jest.fn();

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await AuthController.getConnect(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ token: expect.any(String) });
      expect(redisClient.setEx).toHaveBeenCalledWith(
        `auth_${expect.any(String)}`,
        86400,
        mockUser._id.toString()
      );
    });
  });

  describe('getDisconnect', () => {
    it('should delete the token from Redis', async () => {
      const req = { headers: { 'x-token': 'mockToken' } };
      redisClient.del = jest.fn();

      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await AuthController.getDisconnect(req, res);

      expect(redisClient.del).toHaveBeenCalledWith('auth_mockToken');
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
  });
});
