import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/lib/middleware';
import { findInvoiceById, updateInvoice, deleteInvoice, invoiceToResponse } from '@/lib/models/Invoice';
import { invoiceSchema } from '@/lib/validation';
import { handleError, NotFoundError } from '@/lib/errors';

async function getHandler(request: AuthenticatedRequest, context?: { params: Promise<{ id: string }> }) {
    try {
        if (!context?.params) {
            throw new Error('Missing params');
        }
        const { id } = await context.params;
        const invoice = await findInvoiceById(id);
        if (!invoice) {
            throw new NotFoundError('Invoice');
        }

        return NextResponse.json({
            success: true,
            data: invoiceToResponse(invoice),
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

async function putHandler(request: AuthenticatedRequest, context?: { params: Promise<{ id: string }> }) {
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
        const validatedData = invoiceSchema.partial().parse(body);

        // Recalculate amounts if items are updated
        let updates: any = { ...validatedData };
        if (validatedData.items) {
            const items = validatedData.items.map((item: any) => ({
                ...item,
                amount: item.quantity * item.rate,
            }));
            const subtotal = items.reduce((sum: number, item: any) => sum + item.amount, 0);
            const discount = validatedData.discount ?? invoice.discount;
            const total = subtotal - discount;
            updates.items = items;
            updates.subtotal = subtotal;
            updates.discount = discount;
            updates.total = total;
        } else if (validatedData.discount !== undefined) {
            // If only discount is updated, recalculate total
            const discount = validatedData.discount;
            const total = invoice.subtotal - discount;
            updates.discount = discount;
            updates.total = total;
        }

        if (validatedData.issueDate) {
            updates.issueDate = typeof validatedData.issueDate === 'string' ? new Date(validatedData.issueDate) : validatedData.issueDate;
        }

        const updated = await updateInvoice(id, updates);
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

async function deleteHandler(request: AuthenticatedRequest, context?: { params: Promise<{ id: string }> }) {
    try {
        if (!context?.params) {
            throw new Error('Missing params');
        }
        const { id } = await context.params;
        const invoice = await findInvoiceById(id);
        if (!invoice) {
            throw new NotFoundError('Invoice');
        }

        const deleted = await deleteInvoice(id);
        if (!deleted) {
            throw new NotFoundError('Invoice');
        }

        return NextResponse.json({
            success: true,
            message: 'Invoice deleted successfully',
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

