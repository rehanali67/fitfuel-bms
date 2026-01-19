import { ObjectId } from 'mongodb';
import { getDatabase } from '../mongodb';

export interface ClientDocument {
    _id?: ObjectId;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ClientResponse {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
}

export function clientToResponse(client: ClientDocument): ClientResponse {
    return {
        id: client._id!.toString(),
        name: client.name,
        phone: client.phone,
        email: client.email,
        address: client.address,
    };
}

export async function getClientCollection() {
    const db = await getDatabase();
    return db.collection<ClientDocument>('clients');
}

export async function findClientById(id: string): Promise<ClientDocument | null> {
    const collection = await getClientCollection();
    return collection.findOne({ _id: new ObjectId(id) });
}

export async function findClientByName(name: string): Promise<ClientDocument | null> {
    const collection = await getClientCollection();
    return collection.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
}

export async function searchClients(searchQuery: string, limit: number = 20): Promise<ClientDocument[]> {
    const collection = await getClientCollection();
    const query: any = {};

    if (searchQuery) {
        query.$or = [
            { name: { $regex: searchQuery, $options: 'i' } },
            { phone: { $regex: searchQuery, $options: 'i' } },
        ];
    }

    return collection.find(query).limit(limit).toArray();
}

export async function createClient(clientData: Omit<ClientDocument, '_id' | 'createdAt' | 'updatedAt'>): Promise<ClientDocument> {
    const collection = await getClientCollection();
    const now = new Date();

    // Check if client with same name already exists
    const existing = await findClientByName(clientData.name);
    
    if (existing) {
        // Update existing client
        const result = await collection.findOneAndUpdate(
            { _id: existing._id },
            { $set: { ...clientData, updatedAt: now } },
            { returnDocument: 'after' }
        );
        return result || existing;
    }

    const client: ClientDocument = {
        ...clientData,
        createdAt: now,
        updatedAt: now,
    };
    
    const result = await collection.insertOne(client);
    return { ...client, _id: result.insertedId };
}

export async function updateClient(id: string, updates: Partial<ClientDocument>): Promise<ClientDocument | null> {
    const collection = await getClientCollection();
    const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { ...updates, updatedAt: new Date() } },
        { returnDocument: 'after' }
    );
    return result || null;
}

export async function deleteClient(id: string): Promise<boolean> {
    const collection = await getClientCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
}
