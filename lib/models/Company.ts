import { ObjectId } from 'mongodb';
import { getDatabase } from '../mongodb';

export interface CompanyDocument {
    _id?: ObjectId;
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    zipCode?: string;
    bankName?: string;
    bankAccount?: string;
    bankIBAN?: string;
    bankBranch?: string;
    updatedAt: Date;
}

export interface CompanyResponse {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    zipCode?: string;
    bankName?: string;
    bankAccount?: string;
    bankIBAN?: string;
    bankBranch?: string;
}

export function companyToResponse(company: CompanyDocument): CompanyResponse {
    return {
        id: company._id!.toString(),
        name: company.name,
        email: company.email,
        phone: company.phone,
        address: company.address,
        city: company.city,
        zipCode: company.zipCode,
        bankName: company.bankName,
        bankAccount: company.bankAccount,
        bankIBAN: company.bankIBAN,
        bankBranch: company.bankBranch,
    };
}

export async function getCompanyCollection() {
    const db = await getDatabase();
    return db.collection<CompanyDocument>('company');
}

export async function getCompany(): Promise<CompanyDocument | null> {
    const collection = await getCompanyCollection();
    return collection.findOne({});
}

export async function updateCompany(companyData: Omit<CompanyDocument, '_id' | 'updatedAt'>): Promise<CompanyDocument> {
    const collection = await getCompanyCollection();
    const now = new Date();

    // Check if company exists
    const existing = await collection.findOne({});

    if (existing) {
        // Update existing
        const result = await collection.findOneAndUpdate(
            { _id: existing._id },
            { $set: { ...companyData, updatedAt: now } },
            { returnDocument: 'after' }
        );
        return result || existing;
    } else {
        // Create new
        const company: CompanyDocument = {
            ...companyData,
            updatedAt: now,
        };
        const result = await collection.insertOne(company);
        return { ...company, _id: result.insertedId };
    }
}

