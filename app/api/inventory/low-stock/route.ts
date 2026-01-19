import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/lib/middleware';
import { getProductCollection, productToResponse } from '@/lib/models/Product';
import { handleError } from '@/lib/errors';

async function getHandler(request: AuthenticatedRequest) {
    try {
        const collection = await getProductCollection();
        const products = await collection
            .find({
                $or: [
                    { status: 'Low Stock' },
                    { status: 'Out of Stock' },
                ],
            })
            .toArray();

        return NextResponse.json({
            success: true,
            data: products.map(productToResponse),
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

