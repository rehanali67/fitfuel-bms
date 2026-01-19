import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/lib/middleware';
import { findInvoiceById, updateInvoice, invoiceToResponse } from '@/lib/models/Invoice';
import { findProductById, updateProduct } from '@/lib/models/Product';
import { createStockHistory } from '@/lib/models/StockHistory';
import { z } from 'zod';
import { handleError, NotFoundError, ValidationError } from '@/lib/errors';

const statusSchema = z.object({
    status: z.enum(['Draft', 'Pending', 'Paid', 'Overdue']),
});

async function patchHandler(request: AuthenticatedRequest, context?: { params: Promise<{ id: string }> }) {
    try {
        if (!context?.params) {
            throw new Error('Missing params');
        }
        const { id } = await context.params;
        const invoice = await findInvoiceById(id);
        if (!invoice) {
            throw new NotFoundError('Invoice');
        }

        const body = await request.json();
        const validatedData = statusSchema.parse(body);

        // If invoice was Draft and is being changed to non-Draft, update inventory
        if (invoice.status === 'Draft' && validatedData.status !== 'Draft') {
            try {
                await updateInventoryFromInvoice(invoice.items, id);
            } catch (inventoryError) {
                console.error('Error updating inventory:', inventoryError);
                // Don't fail the status update if inventory update fails
            }
        }

        const updated = await updateInvoice(id, { status: validatedData.status });
        if (!updated) {
            throw new NotFoundError('Invoice');
        }

        return NextResponse.json({
            success: true,
            data: invoiceToResponse(updated),
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

// Helper function to update inventory from invoice items
async function updateInventoryFromInvoice(items: Array<{ quantity: number; productId?: string }>, invoiceId: string) {
    // Group items by productId to handle multiple quantities of same product
    const productUpdates: { [productId: string]: number } = {};

    for (const item of items) {
        if (item.productId) {
            // Quantity can be negative for returns (which adds stock back)
            // Positive quantity deducts stock
            if (productUpdates[item.productId]) {
                productUpdates[item.productId] += item.quantity;
            } else {
                productUpdates[item.productId] = item.quantity;
            }
        }
    }

    // Update each product's stock
    for (const [productId, quantityChange] of Object.entries(productUpdates)) {
        try {
            const product = await findProductById(productId);
            if (product) {
                const previousStock = product.stock;
                const newStock = previousStock - quantityChange; // Subtract because positive quantity means sale
                const finalStock = newStock < 0 ? 0 : newStock;
                
                await updateProduct(productId, { stock: finalStock });

                // Log stock history
                const historyType = quantityChange > 0 ? 'sale' : 'return';
                await createStockHistory({
                    productId,
                    type: historyType,
                    quantity: -quantityChange, // Negative for sales, positive for returns
                    previousStock,
                    newStock: finalStock,
                    reference: invoiceId,
                    referenceType: 'invoice',
                    notes: quantityChange > 0 
                        ? `Sold ${Math.abs(quantityChange)} units via invoice`
                        : `Returned ${Math.abs(quantityChange)} units via invoice`,
                });
            }
        } catch (error) {
            console.error(`Error updating stock for product ${productId}:`, error);
            // Continue with other products even if one fails
        }
    }
}

export const PATCH = requireAuth(patchHandler);

