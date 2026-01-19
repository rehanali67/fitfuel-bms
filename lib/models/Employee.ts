import { ObjectId } from 'mongodb';
import { getDatabase } from '../mongodb';
import { EmployeeStatus } from '@/types/models';

export interface EmployeeDocument {
    _id?: ObjectId;
    name: string;
    email: string;
    phone?: string;
    position?: string;
    department?: string;
    joinDate?: string;
    status: EmployeeStatus;
    salary?: string;
    manager?: string;
    location?: string;
    bio?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface EmployeeResponse {
    id: string;
    name: string;
    email: string;
    phone: string;
    position: string;
    department: string;
    joinDate: string;
    status: EmployeeStatus;
    salary?: string;
    manager?: string;
    location?: string;
    bio?: string;
}

export function employeeToResponse(employee: EmployeeDocument): EmployeeResponse {
    return {
        id: employee._id!.toString(),
        name: employee.name,
        email: employee.email,
        phone: employee.phone || '',
        position: employee.position || '',
        department: employee.department || '',
        joinDate: employee.joinDate || '',
        status: employee.status,
        salary: employee.salary,
        manager: employee.manager,
        location: employee.location,
        bio: employee.bio,
    };
}

export async function getEmployeeCollection() {
    const db = await getDatabase();
    return db.collection<EmployeeDocument>('employees');
}

export async function findEmployeeById(id: string): Promise<EmployeeDocument | null> {
    const collection = await getEmployeeCollection();
    return collection.findOne({ _id: new ObjectId(id) });
}

export async function createEmployee(employeeData: Omit<EmployeeDocument, '_id' | 'createdAt' | 'updatedAt'>): Promise<EmployeeDocument> {
    const collection = await getEmployeeCollection();
    const now = new Date();
    const employee: EmployeeDocument = {
        ...employeeData,
        createdAt: now,
        updatedAt: now,
    };
    const result = await collection.insertOne(employee);
    return { ...employee, _id: result.insertedId };
}

export async function updateEmployee(id: string, updates: Partial<EmployeeDocument>): Promise<EmployeeDocument | null> {
    const collection = await getEmployeeCollection();
    const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { ...updates, updatedAt: new Date() } },
        { returnDocument: 'after' }
    );
    return result || null;
}

export async function deleteEmployee(id: string): Promise<boolean> {
    const collection = await getEmployeeCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
}

