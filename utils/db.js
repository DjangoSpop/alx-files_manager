import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const url = `mongodb://${host}:${port}/${database}`;
    this.client = new MongoClient(url, { useUnifiedTopology: true });
    this.db = null;
  }

  async connect() {
    try {
      await this.client.connect();
      this.db = this.client.db();
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
    }
  }

  disconnect() {
    this.client.close();
    this.db = null;
    console.log('Disconnected from MongoDB');
  }

  isAlive() {
    return this.db !== null;
  }

  async nbUsers() {
    try {
      const collection = this.db.collection('users');
      const count = await collection.countDocuments();
      return count;
    } catch (error) {
      console.error('Error counting documents in "users" collection:', error);
      return 0;
    }
  }

  async nbFiles() {
    try {
      const collection = this.db.collection('files');
      const count = await collection.countDocuments();
      return count;
    } catch (error) {
      console.error('Error counting documents in "files" collection:', error);
      return 0;
    }
  }
}

const dbClient = new DBClient();
dbClient.connect();

export default dbClient;
