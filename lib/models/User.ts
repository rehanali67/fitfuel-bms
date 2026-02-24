import { ObjectId } from 'mongodb';
import { getDatabase } from '../mongodb';
import { UserRole } from '@/types/models';

export interface UserDocument {
    _id?: ObjectId;
    email: string;
    password: string; // hashed
    name: string;
    role: UserRole;
    avatar?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserResponse {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatar?: string;
}

export function userToResponse(user: UserDocument): UserResponse {
    return {
        id: user._id!.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
    };
}

export async function getUserCollection() {
    const db = await getDatabase();
    return db.collection<UserDocument>('users');
}

export async function findUserByEmail(email: string): Promise<UserDocument | null> {
    const collection = await getUserCollection();
    return collection.findOne({ email: email.toLowerCase() });
}

export async function findUserById(id: string): Promise<UserDocument | null> {
    const collection = await getUserCollection();
    return collection.findOne({ _id: new ObjectId(id) });
}

export async function createUser(userData: Omit<UserDocument, '_id' | 'createdAt' | 'updatedAt'>): Promise<UserDocument> {
    const collection = await getUserCollection();
    const now = new Date();
    const user: UserDocument = {
        ...userData,
        email: userData.email.toLowerCase(),
        createdAt: now,
        updatedAt: now,
    };
    const result = await collection.insertOne(user);
    return { ...user, _id: result.insertedId };
}

export async function getAllUsers(): Promise<UserDocument[]> {
    const collection = await getUserCollection();
    return collection.find({}).sort({ createdAt: -1 }).toArray();
}

export async function updateUser(id: string, updates: Partial<Omit<UserDocument, '_id' | 'createdAt'>>): Promise<UserDocument | null> {
    const collection = await getUserCollection();
    if (updates.email) {
        updates.email = updates.email.toLowerCase();
    }
    const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { ...updates, updatedAt: new Date() } },
        { returnDocument: 'after' }
    );
    return result || null;
}

export async function deleteUser(id: string): Promise<boolean> {
    const collection = await getUserCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1;
}

