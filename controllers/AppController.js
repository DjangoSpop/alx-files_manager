import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppController {
  static async getStatus(req, res) {
    try {
      const redisAlive = await redisClient.isAlive();
      const dbAlive = await dbClient.isAlive();
      res.status(200).json({ redis: redisAlive, db: dbAlive });
    } catch (err) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getStats(req, res) {
    try {
      const users = await dbClient.nbUsers();
      const files = await dbClient.nbFiles();
      res.status(200).json({ users, files });
    } catch (err) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default AppController;
