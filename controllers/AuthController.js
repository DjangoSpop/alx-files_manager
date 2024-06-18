import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongodb';
import sha1 from 'sha1';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AuthController {
  static async getConnect(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Missing email or password' });
      }

      const user = await dbClient.db.collection('users').findOne({ email });
      if (!user || sha1(password) !== user.password) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = uuidv4();
      const expirationTime = 24 * 60 * 60; // 24 hours in seconds
      await redisClient.setEx(`auth_${token}`, expirationTime, user._id.toString());

      return res.status(200).json({ token });
    } catch (err) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getDisconnect(req, res) {
    try {
      const token = req.headers['x-token'];
      await redisClient.del(`auth_${token}`);
      return res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
export default AuthController;
