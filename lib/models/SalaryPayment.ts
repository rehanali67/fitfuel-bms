import { ObjectId } from 'mongodb';
import { getDatabase } from '../mongodb';

export interface SalaryPaymentDocument {
    _id?: ObjectId;
    employeeId: string;
    employeeName: string; // denormalized
    amount: number;
    paymentDate: Date;
    month: number; // 1-12
    year: number;
    notes?: string;
    createdAt: Date;
}

export interface SalaryPaymentResponse {
    id: string;
    employeeId: string;
    employeeName: string;
    amount: number;
    paymentDate: string; // ISO string
    month: number;
    year: number;
    notes?: string;
    createdAt: string;
    monthLabel: string; // e.g. "February 2026"
}

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

export function salaryPaymentToResponse(doc: SalaryPaymentDocument): SalaryPaymentResponse {
    return {
        id: doc._id!.toString(),
        employeeId: doc.employeeId,
        employeeName: doc.employeeName,
        amount: doc.amount,
        paymentDate: doc.paymentDate.toISOString(),
        month: doc.month,
        year: doc.year,
        notes: doc.notes,
        createdAt: doc.createdAt.toISOString(),
        monthLabel: `${MONTH_NAMES[doc.month - 1]} ${doc.year}`,
    };
}

export async function getSalaryPaymentCollection() {
    const db = await getDatabase();
    return db.collection<SalaryPaymentDocument>('salaryPayments');
}

export async function createSalaryPayment(
    data: Omit<SalaryPaymentDocument, '_id' | 'createdAt'>
): Promise<SalaryPaymentDocument> {
    const collection = await getSalaryPaymentCollection();
    const doc: SalaryPaymentDocument = { ...data, createdAt: new Date() };
    const result = await collection.insertOne(doc);
    return { ...doc, _id: result.insertedId };
}

export async function getSalaryPayments(
    employeeId?: string,
    year?: number,
    month?: number
): Promise<SalaryPaymentDocument[]> {
    const collection = await getSalaryPaymentCollection();
    const query: any = {};
    if (employeeId) query.employeeId = employeeId;
    if (year !== undefined) query.year = year;
    if (month !== undefined) query.month = month;
    return collection.find(query).sort({ paymentDate: -1 }).toArray();
}

export async function deleteSalaryPayment(id: string): Promise<boolean> {
    const collection = await getSalaryPaymentCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1;
}

export async function getTotalSalaryExpenses(from: Date, to: Date): Promise<number> {
    const collection = await getSalaryPaymentCollection();
    const result = await collection
        .aggregate([
            { $match: { paymentDate: { $gte: from, $lte: to } } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ])
        .toArray();
    return result[0]?.total ?? 0;
}
