import { ObjectId } from 'mongodb';
import { getDatabase } from '../mongodb';

export interface CategoryDocument {
    _id?: ObjectId;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CategoryResponse {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

export function categoryToResponse(category: CategoryDocument): CategoryResponse {
    return {
        id: category._id!.toString(),
        name: category.name,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
    };
}

export async function getCategoryCollection() {
    const db = await getDatabase();
    return db.collection<CategoryDocument>('categories');
}

export async function findAllCategories(): Promise<CategoryDocument[]> {
    const collection = await getCategoryCollection();
    return collection.find({}).sort({ name: 1 }).toArray();
}

export async function findCategoryById(id: string): Promise<CategoryDocument | null> {
    const collection = await getCategoryCollection();
    return collection.findOne({ _id: new ObjectId(id) });
}

export async function findCategoryByName(name: string): Promise<CategoryDocument | null> {
    const collection = await getCategoryCollection();
    return collection.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
}

export async function createCategory(categoryData: Omit<CategoryDocument, '_id' | 'createdAt' | 'updatedAt'>): Promise<CategoryDocument> {
    const collection = await getCategoryCollection();
    const now = new Date();
    
    // Check if category with same name already exists (case-insensitive)
    const existing = await findCategoryByName(categoryData.name);
    if (existing) {
        throw new Error('Category with this name already exists');
    }
    
    const category: CategoryDocument = {
        ...categoryData,
        createdAt: now,
        updatedAt: now,
    };
    const result = await collection.insertOne(category);
    return { ...category, _id: result.insertedId };
}

export async function updateCategory(id: string, updates: Partial<CategoryDocument>): Promise<CategoryDocument | null> {
    const collection = await getCategoryCollection();
    
    // If name is being updated, check for duplicates
    if (updates.name) {
        const existing = await findCategoryByName(updates.name);
        if (existing && existing._id!.toString() !== id) {
            throw new Error('Category with this name already exists');
        }
    }
    
    const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { ...updates, updatedAt: new Date() } },
        { returnDocument: 'after' }
    );
    return result || null;
}

export async function deleteCategory(id: string): Promise<boolean> {
    const collection = await getCategoryCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
}
