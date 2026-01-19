import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/lib/middleware';
import { getProductCollection, productToResponse } from '@/lib/models/Product';
import { handleError, NotFoundError } from '@/lib/errors';

async function getHandler(request: AuthenticatedRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sku = searchParams.get('sku');

        if (!sku || sku.trim() === '') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'SKU parameter is required',
                },
                { status: 400 }
            );
        }

        const collection = await getProductCollection();
        const product = await collection.findOne({ 
            sku: { $regex: new RegExp(`^${sku.trim()}$`, 'i') } 
        });

        if (!product) {
            throw new NotFoundError('Product');
        }

        return NextResponse.json({
            success: true,
            data: productToResponse(product),
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
