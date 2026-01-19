import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/lib/middleware';
import { findProductById, updateProduct, productToResponse } from '@/lib/models/Product';
import { createStockHistory } from '@/lib/models/StockHistory';
import { handleError, NotFoundError, ValidationError } from '@/lib/errors';
import { z } from 'zod';

const adjustStockSchema = z.object({
    quantity: z.number().int(),
    type: z.enum(['manual_add', 'manual_remove']),
    notes: z.string().optional(),
});

async function postHandler(request: AuthenticatedRequest, context?: { params: Promise<{ id: string }> }) {
    try {
        if (!context?.params) {
            throw new Error('Missing params');
        }
        const { id } = await context.params;
        
        const product = await findProductById(id);
        if (!product) {
            throw new NotFoundError('Product');
        }

        const body = await request.json();
        const validatedData = adjustStockSchema.parse(body);

        const previousStock = product.stock;
        let newStock: number;

        if (validatedData.type === 'manual_add') {
            newStock = previousStock + validatedData.quantity;
        } else {
            // manual_remove
            newStock = previousStock - validatedData.quantity;
            if (newStock < 0) {
                throw new ValidationError('Insufficient stock', {
                    stock: `Only ${previousStock} units available`,
                });
            }
        }

        // Update product stock
        const updated = await updateProduct(id, { stock: newStock });
        if (!updated) {
            throw new NotFoundError('Product');
        }

        // Log stock history
        await createStockHistory({
            productId: id,
            type: validatedData.type,
            quantity: validatedData.type === 'manual_add' ? validatedData.quantity : -validatedData.quantity,
            previousStock,
            newStock,
            referenceType: 'manual',
            notes: validatedData.notes,
        });

        return NextResponse.json({
            success: true,
            data: productToResponse(updated),
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

export const POST = requireAuth(postHandler);

