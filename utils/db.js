import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const uri = `mongodb://${host}:${port}/`;

    this.client = new MongoClient(uri, { useUnifiedTopology: true });
    this.db = null; // Store the database reference once connected

    this.connect(); // Initiate connection immediately
  }

  async connect() {
    try {
      await this.client.connect();
      this.db = this.client.db(process.env.DB_DATABASE || 'files_manager');
      console.log('Connected to MongoDB');
    } catch (err) {
      console.error('MongoDB Connection Error:', err);
    }
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    if (!this.isAlive()) {
      await this.connect(); // Attempt reconnection if not alive
    }
    return this.db.collection('users').countDocuments();
  }

  async nbFiles() {
    if (!this.isAlive()) {
      await this.connect(); // Attempt reconnection if not alive
    }
    return this.db.collection('files').countDocuments();
  }
}

const dbClient = new DBClient();
export default dbClient;
