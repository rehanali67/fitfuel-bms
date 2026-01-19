import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/lib/middleware';
import { findProductById, updateProduct, deleteProduct, productToResponse } from '@/lib/models/Product';
import { createStockHistory } from '@/lib/models/StockHistory';
import { productSchema } from '@/lib/validation';
import { handleError, NotFoundError } from '@/lib/errors';

async function getHandler(request: AuthenticatedRequest, context?: { params?: Promise<{ id: string }> }) {
    try {
        if (!context?.params) {
            throw new NotFoundError('Product');
        }
        const { id } = await context.params;
        const product = await findProductById(id);
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

async function putHandler(request: AuthenticatedRequest, context?: { params?: Promise<{ id: string }> }) {
    try {
        if (!context?.params) {
            throw new NotFoundError('Product');
        }
        const { id } = await context.params;
        const product = await findProductById(id);
        if (!product) {
            throw new NotFoundError('Product');
        }

        const body = await request.json();
        const validatedData = productSchema.partial().parse(body);

        // Convert expiryDate string to Date if provided
        const updateData = {
            ...validatedData,
            expiryDate: validatedData.expiryDate !== undefined
                ? (validatedData.expiryDate === null || validatedData.expiryDate === ''
                    ? undefined
                    : typeof validatedData.expiryDate === 'string'
                        ? new Date(validatedData.expiryDate)
                        : validatedData.expiryDate)
                : undefined,
        };

        // Track stock changes for history
        const previousStock = product.stock;
        const stockChanged = updateData.stock !== undefined && updateData.stock !== previousStock;

        const updated = await updateProduct(id, updateData);
        if (!updated) {
            throw new NotFoundError('Product');
        }

        // Log stock history if stock changed
        if (stockChanged) {
            const quantity = updated.stock - previousStock;
            await createStockHistory({
                productId: id,
                type: 'update',
                quantity,
                previousStock,
                newStock: updated.stock,
                referenceType: 'system',
                notes: 'Stock updated via product edit',
            });
        }

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

async function deleteHandler(request: AuthenticatedRequest, context?: { params?: Promise<{ id: string }> }) {
    try {
        if (!context?.params) {
            throw new NotFoundError('Product');
        }
        const { id } = await context.params;
        const product = await findProductById(id);
        if (!product) {
            throw new NotFoundError('Product');
        }

        const deleted = await deleteProduct(id);
        if (!deleted) {
            throw new NotFoundError('Product');
        }

        return NextResponse.json({
            success: true,
            message: 'Product deleted successfully',
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

