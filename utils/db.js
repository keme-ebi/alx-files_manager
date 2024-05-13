import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';

    const url = `mongodb://${host}:${port}`;

    this.client = new MongoClient(url, { useUnifiedTopology: true });

    this.client.connect().then(() => {
      this.db = this.client.db(database);
    }).catch((err) => {
      console.log(`Connection error: ${err}`);
    });
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    const collections = this.db.collection('users');
    const count = await collections.countDocuments();
    return count;
  }

  async nbFiles() {
    const collections = this.db.collection('files');
    const count = await collections.countDocuments();
    return count;
  }
}

const dbClient = new DBClient();

module.exports = dbClient;
