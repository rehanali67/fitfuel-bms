import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/lib/middleware';
import { findProductById } from '@/lib/models/Product';
import { getStockHistoryByProduct, stockHistoryToResponse } from '@/lib/models/StockHistory';
import { handleError, NotFoundError } from '@/lib/errors';

async function getHandler(request: AuthenticatedRequest, context?: { params: Promise<{ id: string }> }) {
    try {
        if (!context?.params) {
            throw new Error('Missing params');
        }
        const { id } = await context.params;

        // Verify product exists
        const product = await findProductById(id);
        if (!product) {
            throw new NotFoundError('Product');
        }

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50', 10);

        // Get stock history
        const history = await getStockHistoryByProduct(id, limit);

        return NextResponse.json({
            success: true,
            data: history.map(stockHistoryToResponse),
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

