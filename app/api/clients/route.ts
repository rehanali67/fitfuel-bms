import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/lib/middleware';
import { getClientCollection, createClient, searchClients, clientToResponse } from '@/lib/models/Client';
import { handleError } from '@/lib/errors';
import { z } from 'zod';

const clientSchema = z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('Invalid email address').optional(),
    address: z.string().optional(),
}).refine(
    (data) => data.name || data.phone,
    {
        message: "Either name or phone must be provided",
        path: ["name"],
    }
);

async function getHandler(request: AuthenticatedRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const limit = parseInt(searchParams.get('limit') || '20', 10);

        const clients = await searchClients(search, limit);

        return NextResponse.json({
            success: true,
            data: clients.map(clientToResponse),
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

async function postHandler(request: AuthenticatedRequest) {
    try {
        const body = await request.json();
        
        // Normalize empty strings to undefined
        const cleanedBody = Object.fromEntries(
            Object.entries(body).map(([key, value]) => [
                key, 
                typeof value === 'string' && value.trim() === '' ? undefined : value
            ])
        );
        
        const validatedData = clientSchema.parse(cleanedBody);

        // If name is not provided but phone is, use phone as name
        const clientName = validatedData.name?.trim() || validatedData.phone?.trim() || 'Customer';
        const clientPhone = validatedData.phone?.trim() || undefined;
        
        const clientData = {
            name: clientName,
            phone: clientPhone,
            email: validatedData.email?.trim() || undefined,
            address: validatedData.address?.trim() || undefined,
        };

        const client = await createClient(clientData);

        return NextResponse.json({
            success: true,
            data: clientToResponse(client),
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

export const GET = requireAuth(getHandler);
export const POST = requireAuth(postHandler);
