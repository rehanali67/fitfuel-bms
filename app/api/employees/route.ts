import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/lib/middleware';
import { getEmployeeCollection, createEmployee, employeeToResponse } from '@/lib/models/Employee';
import { employeeSchema, paginationSchema } from '@/lib/validation';
import { handleError, ValidationError } from '@/lib/errors';
import { PaginatedResponse, EmployeeResponse } from '@/types/api';

async function getHandler(request: AuthenticatedRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const pagination = paginationSchema.parse({
            page: searchParams.get('page') ?? undefined,
            limit: searchParams.get('limit') ?? undefined,
            search: searchParams.get('search') ?? undefined,
            sortBy: searchParams.get('sortBy') ?? undefined,
            sortOrder: searchParams.get('sortOrder') ?? undefined,
        });

        const collection = await getEmployeeCollection();
        const query: any = {};

        // Search filter
        if (pagination.search) {
            query.$or = [
                { name: { $regex: pagination.search, $options: 'i' } },
                { email: { $regex: pagination.search, $options: 'i' } },
                { position: { $regex: pagination.search, $options: 'i' } },
            ];
        }

        // Department filter
        const department = searchParams.get('department');
        if (department) {
            query.department = department;
        }

        // Status filter
        const status = searchParams.get('status');
        if (status) {
            query.status = status;
        }

        const skip = (pagination.page - 1) * pagination.limit;
        const sortField = pagination.sortBy || 'createdAt';
        const sortOrder = pagination.sortOrder === 'asc' ? 1 : -1;

        const [data, total] = await Promise.all([
            collection
                .find(query)
                .sort({ [sortField]: sortOrder })
                .skip(skip)
                .limit(pagination.limit)
                .toArray(),
            collection.countDocuments(query),
        ]);

        const response: PaginatedResponse<EmployeeResponse> = {
            data: data.map(employeeToResponse),
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                total,
                totalPages: Math.ceil(total / pagination.limit),
            },
        };

        return NextResponse.json({
            success: true,
            data: response,
        });
    } catch (error) {
        const { statusCode, message, errors } = handleError(error);
        return NextResponse.json(
            {
                success: false,
                error: message,
                errors,
            },
            { status: statusCode }
        );
    }
}

async function postHandler(request: AuthenticatedRequest) {
    try {
        const body = await request.json();
        const validatedData = employeeSchema.parse(body);

        const employee = await createEmployee({
            ...validatedData,
            status: validatedData.status || 'active',
        });

        return NextResponse.json(
            {
                success: true,
                data: employeeToResponse(employee),
            },
            { status: 201 }
        );
    } catch (error) {
        const { statusCode, message, errors } = handleError(error);
        return NextResponse.json(
            {
                success: false,
                error: message,
                errors,
            },
            { status: statusCode }
        );
    }
}

export const GET = requireAuth(getHandler);
export const POST = requireAuth(postHandler);

