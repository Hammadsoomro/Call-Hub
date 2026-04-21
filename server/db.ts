import { MongoClient, Db } from 'mongodb';

let mongoClient: MongoClient | null = null;
let db: Db | null = null;

const mongoUrl = process.env.MONGODB_URI || 'mongodb+srv://Hammad:Soomro@connectify.fvitf7a.mongodb.net/?appName=Connectify';

export async function connectDB(): Promise<Db> {
  if (db) {
    return db;
  }

  try {
    mongoClient = new MongoClient(mongoUrl);
    await mongoClient.connect();
    db = mongoClient.db('callhub');
    
    // Create indexes
    const users = db.collection('users');
    const calls = db.collection('calls');
    const numbers = db.collection('phone_numbers');
    
    await users.createIndex({ email: 1 }, { unique: true });
    await calls.createIndex({ userId: 1, timestamp: -1 });
    await numbers.createIndex({ userId: 1 });
    
    console.log('Connected to MongoDB');
    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

export function getDB(): Db {
  if (!db) {
    throw new Error('Database not connected');
  }
  return db;
}

export async function closeDB(): Promise<void> {
  if (mongoClient) {
    await mongoClient.close();
  }
}

// User model
export interface User {
  _id?: string;
  email: string;
  name: string;
  password?: string;
  telnyxApiKey?: string;
  telnyxBalance?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Call model
export interface Call {
  _id?: string;
  userId: string;
  contactName: string;
  phoneNumber: string;
  duration: number;
  timestamp: Date;
  type: 'incoming' | 'outgoing';
  selectedNumber?: string;
}

// Phone Number model
export interface PhoneNumber {
  _id?: string;
  userId: string;
  telnyxId: string;
  number: string;
  country: string;
  areaCode: string;
  purchasedDate: Date;
  renewalDate: Date;
}

// Helper functions
export async function createUser(user: Omit<User, '_id'>): Promise<User> {
  const db = getDB();
  const result = await db.collection('users').insertOne({
    ...user,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return { ...user, _id: result.insertedId.toString() };
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const db = getDB();
  return db.collection('users').findOne({ email }) as Promise<User | null>;
}

export async function getUserById(id: string): Promise<User | null> {
  const db = getDB();
  const { ObjectId } = await import('mongodb');
  return db.collection('users').findOne({ _id: new ObjectId(id) }) as Promise<User | null>;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<void> {
  const db = getDB();
  const { ObjectId } = await import('mongodb');
  await db.collection('users').updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...updates, updatedAt: new Date() } }
  );
}

export async function createCall(call: Omit<Call, '_id'>): Promise<Call> {
  const db = getDB();
  const result = await db.collection('calls').insertOne(call);
  return { ...call, _id: result.insertedId.toString() };
}

export async function getCallsByUserId(userId: string): Promise<Call[]> {
  const db = getDB();
  const { ObjectId } = await import('mongodb');
  return db.collection('calls')
    .find({ userId: new ObjectId(userId) })
    .sort({ timestamp: -1 })
    .toArray() as Promise<Call[]>;
}

export async function savePhoneNumber(number: Omit<PhoneNumber, '_id'>): Promise<PhoneNumber> {
  const db = getDB();
  const result = await db.collection('phone_numbers').insertOne(number);
  return { ...number, _id: result.insertedId.toString() };
}

export async function getPhoneNumbersByUserId(userId: string): Promise<PhoneNumber[]> {
  const db = getDB();
  const { ObjectId } = await import('mongodb');
  return db.collection('phone_numbers')
    .find({ userId: new ObjectId(userId) })
    .toArray() as Promise<PhoneNumber[]>;
}
