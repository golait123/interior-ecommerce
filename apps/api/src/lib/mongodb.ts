import mongoose from 'mongoose';

interface MongoStatus {
  connected: boolean;
  mode: 'live' | 'in-memory' | 'disconnected';
  uri: string;
  database: string;
  error?: string;
}

let mongoStatus: MongoStatus = {
  connected: false,
  mode: 'disconnected',
  uri: '',
  database: 'interiorg'
};

let memoryServerInstance: any = null;

export async function connectMongoDB(): Promise<typeof mongoose> {
  const targetUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/interiorg';

  try {
    // Attempt connecting to the configured MongoDB URI with a short timeout
    await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: 2500,
      connectTimeoutMS: 2500,
    });

    mongoStatus = {
      connected: true,
      mode: 'live',
      uri: targetUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'), // sanitize credentials
      database: mongoose.connection.name || 'interiorg'
    };

    console.log(`🍃 MongoDB Connected [Live]: ${mongoStatus.uri}`);
    import('./seedMongo').then(m => m.seedMongoInitialData()).catch(() => {});
    return mongoose;
  } catch (liveErr: any) {
    console.warn(`⚠️ Direct MongoDB connection to ${targetUri} timed out or failed: ${liveErr?.message || liveErr}`);
    console.log('🔄 Initializing embedded in-memory MongoDB instance for development & testing...');

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServerInstance = await MongoMemoryServer.create({
        instance: {
          dbName: 'interiorg'
        }
      });

      const memUri = memoryServerInstance.getUri();
      await mongoose.connect(memUri);

      mongoStatus = {
        connected: true,
        mode: 'in-memory',
        uri: memUri,
        database: 'interiorg'
      };

      console.log(`🍃 MongoDB Connected [In-Memory]: ${memUri}`);
      import('./seedMongo').then(m => m.seedMongoInitialData()).catch(() => {});
      return mongoose;
    } catch (memErr: any) {
      console.error('❌ Failed to initialize in-memory MongoDB:', memErr?.message || memErr);
      mongoStatus = {
        connected: false,
        mode: 'disconnected',
        uri: targetUri,
        database: 'interiorg',
        error: memErr?.message || String(memErr)
      };
      return mongoose;
    }
  }
}

export function getMongoStatus(): MongoStatus {
  return {
    ...mongoStatus,
    connected: mongoose.connection.readyState === 1
  };
}

export async function disconnectMongoDB(): Promise<void> {
  try {
    await mongoose.disconnect();
    if (memoryServerInstance) {
      await memoryServerInstance.stop();
    }
    mongoStatus.connected = false;
  } catch (err) {
    console.error('Error disconnecting MongoDB:', err);
  }
}

export default mongoose;
