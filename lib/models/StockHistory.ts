import { ObjectId } from 'mongodb';
import { getDatabase } from '../mongodb';

export type StockHistoryType = 'sale' | 'return' | 'adjustment' | 'initial' | 'manual_add' | 'manual_remove' | 'update';

export interface StockHistoryDocument {
    _id?: ObjectId;
    productId: string;
    type: StockHistoryType;
    quantity: number; // Positive for additions, negative for removals
    previousStock: number;
    newStock: number;
    reference?: string; // Invoice ID, Quotation ID, or other reference
    referenceType?: 'invoice' | 'quotation' | 'manual' | 'system';
    notes?: string;
    createdBy?: string; // User ID if available
    createdAt: Date;
}

export interface StockHistoryResponse {
    id: string;
    productId: string;
    type: StockHistoryType;
    quantity: number;
    previousStock: number;
    newStock: number;
    reference?: string;
    referenceType?: 'invoice' | 'quotation' | 'manual' | 'system';
    notes?: string;
    createdBy?: string;
    createdAt: string; // ISO date string
    typeLabel: string; // Human-readable type label
    quantityLabel: string; // Formatted quantity (e.g., "+5" or "-3")
}

export function stockHistoryToResponse(history: StockHistoryDocument): StockHistoryResponse {
    const typeLabels: Record<StockHistoryType, string> = {
        'sale': 'Sale',
        'return': 'Return',
        'adjustment': 'Adjustment',
        'initial': 'Initial Stock',
        'manual_add': 'Manual Addition',
        'manual_remove': 'Manual Removal',
        'update': 'Stock Update',
    };

    return {
        id: history._id!.toString(),
        productId: history.productId,
        type: history.type,
        quantity: history.quantity,
        previousStock: history.previousStock,
        newStock: history.newStock,
        reference: history.reference,
        referenceType: history.referenceType,
        notes: history.notes,
        createdBy: history.createdBy,
        createdAt: history.createdAt.toISOString(),
        typeLabel: typeLabels[history.type] || history.type,
        quantityLabel: history.quantity >= 0 ? `+${history.quantity}` : `${history.quantity}`,
    };
}

export async function getStockHistoryCollection() {
    const db = await getDatabase();
    return db.collection<StockHistoryDocument>('stockHistory');
}

export async function createStockHistory(historyData: Omit<StockHistoryDocument, '_id' | 'createdAt'>): Promise<StockHistoryDocument> {
    const collection = await getStockHistoryCollection();
    const history: StockHistoryDocument = {
        ...historyData,
        createdAt: new Date(),
    };
    const result = await collection.insertOne(history);
    return { ...history, _id: result.insertedId };
}

export async function getStockHistoryByProduct(productId: string, limit: number = 50): Promise<StockHistoryDocument[]> {
    const collection = await getStockHistoryCollection();
    return collection
        .find({ productId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
}

export async function getStockHistoryByReference(reference: string, referenceType: 'invoice' | 'quotation'): Promise<StockHistoryDocument[]> {
    const collection = await getStockHistoryCollection();
    return collection
        .find({ reference, referenceType })
        .sort({ createdAt: -1 })
        .toArray();
}

