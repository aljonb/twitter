import { MongoClient, ServerApiVersion } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local')
}

const uri = process.env.MONGODB_URI;

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  connectTimeoutMS: 30000,
  socketTimeoutMS: 30000,
  maxPoolSize: 10,
  minPoolSize: 5,
  minTlsVersion: 'TLS1_2', // Ensures TLS 1.2 is used
  // maxTlsVersion: 'TLS1_3', // Optional: Specify if needed
  replicaSet: 'atlas-12mtjl-shard-0',
  authSource: 'admin',
  retryWrites: true,
};

const client = new MongoClient(uri, options);

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable to preserve the value across module reloads
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, don't use a global variable
  clientPromise = client.connect()
}

export default clientPromise;
