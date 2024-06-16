import { MongoClient } from 'mongodb';

// Assuming you have a separate module for environment variables
import { DB_HOST, DB_PORT, DB_DATABASE } from './config';  // Adjusted import

class DBClient {
  constructor() {
    const host = DB_HOST || 'localhost'; // Use imported variables
    const port = DB_PORT || 27017;
    const database = DB_DATABASE || 'files_manager';
    const uri = `mongodb://${host}:${port}/`;  // Construct the full URI

    this.client = new MongoClient(uri, { useUnifiedTopology: true });
    this.db = null; // Store database reference after connection
  }

  async connect() { 
    try {
      await this.client.connect();
      this.db = this.client.db(DB_DATABASE); // Use the imported variable
      console.log('Connected to MongoDB');
    } catch (err) {
      console.error('MongoDB Connection Error:', err);
      // You can potentially add retry logic or error handling here
    }
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    if (!this.isAlive()) {
      await this.connect(); // Ensure connection before querying
    }
    return this.db.collection('users').countDocuments(); 
  }

  async nbFiles() {
    if (!this.isAlive()) {
      await this.connect();
    }
    return this.db.collection('files').countDocuments(); 
  }
}

const dbClient = new DBClient();
await dbClient.connect(); // Establish connection immediately
export default dbClient;
