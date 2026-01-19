import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/lib/middleware';
import { findClientById, updateClient, deleteClient, clientToResponse } from '@/lib/models/Client';
import { handleError, NotFoundError } from '@/lib/errors';
import { z } from 'zod';

const updateClientSchema = z.object({
    name: z.string().min(1, 'Client name is required').optional(),
    phone: z.string().optional(),
    email: z.string().email('Invalid email address').optional(),
    address: z.string().optional(),
});

async function getHandler(request: AuthenticatedRequest, context?: { params?: Promise<{ id: string }> }) {
    try {
        if (!context?.params) {
            throw new NotFoundError('Client');
        }
        const { id } = await context.params;
        const client = await findClientById(id);
        if (!client) {
            throw new NotFoundError('Client');
        }

        return NextResponse.json({
            success: true,
            data: clientToResponse(client),
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
            throw new NotFoundError('Client');
        }
        const { id } = await context.params;
        const client = await findClientById(id);
        if (!client) {
            throw new NotFoundError('Client');
        }

        const body = await request.json();
        const validatedData = updateClientSchema.parse(body);

        const updated = await updateClient(id, validatedData);
        if (!updated) {
            throw new NotFoundError('Client');
        }

        return NextResponse.json({
            success: true,
            data: clientToResponse(updated),
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
            throw new NotFoundError('Client');
        }
        const { id } = await context.params;
        const client = await findClientById(id);
        if (!client) {
            throw new NotFoundError('Client');
        }

        const deleted = await deleteClient(id);
        if (!deleted) {
            throw new NotFoundError('Client');
        }

        return NextResponse.json({
            success: true,
            message: 'Client deleted successfully',
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

