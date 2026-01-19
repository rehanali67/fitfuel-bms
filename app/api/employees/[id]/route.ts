import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/lib/middleware';
import { findEmployeeById, updateEmployee, deleteEmployee, employeeToResponse } from '@/lib/models/Employee';
import { employeeSchema } from '@/lib/validation';
import { handleError, NotFoundError } from '@/lib/errors';

async function getHandler(request: AuthenticatedRequest, context?: { params?: Promise<{ id: string }> }) {
    try {
        if (!context?.params) {
            throw new NotFoundError('Employee');
        }
        const { id } = await context.params;
        const employee = await findEmployeeById(id);
        if (!employee) {
            throw new NotFoundError('Employee');
        }

        return NextResponse.json({
            success: true,
            data: employeeToResponse(employee),
        });
    } catch (error) {
        const { statusCode, message } = handleError(error);
        return NextResponse.json(
            {
                success: false,
                error: message,
            },
            { status: statusCode }
        );
    }
}

async function putHandler(request: AuthenticatedRequest, context?: { params?: Promise<{ id: string }> }) {
    try {
        if (!context?.params) {
            throw new NotFoundError('Employee');
        }
        const { id } = await context.params;
        const employee = await findEmployeeById(id);
        if (!employee) {
            throw new NotFoundError('Employee');
        }

        const body = await request.json();
        const validatedData = employeeSchema.partial().parse(body);

        const updated = await updateEmployee(id, validatedData);
        if (!updated) {
            throw new NotFoundError('Employee');
        }

        return NextResponse.json({
            success: true,
            data: employeeToResponse(updated),
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

async function deleteHandler(request: AuthenticatedRequest, context?: { params?: Promise<{ id: string }> }) {
    try {
        if (!context?.params) {
            throw new NotFoundError('Employee');
        }
        const { id } = await context.params;
        const employee = await findEmployeeById(id);
        if (!employee) {
            throw new NotFoundError('Employee');
        }

        const deleted = await deleteEmployee(id);
        if (!deleted) {
            throw new NotFoundError('Employee');
        }

        return NextResponse.json({
            success: true,
            message: 'Employee deleted successfully',
        });
    } catch (error) {
        const { statusCode, message } = handleError(error);
        return NextResponse.json(
            {
                success: false,
                error: message,
            },
            { status: statusCode }
        );
    }
}

export const GET = requireAuth(getHandler);
export const PUT = requireAuth(putHandler);
export const DELETE = requireAuth(deleteHandler);

