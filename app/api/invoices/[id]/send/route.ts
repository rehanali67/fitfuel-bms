import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/lib/middleware';
import { findInvoiceById, updateInvoice, invoiceToResponse } from '@/lib/models/Invoice';
import { handleError, NotFoundError } from '@/lib/errors';

async function postHandler(request: AuthenticatedRequest, context?: { params: Promise<{ id: string }> }) {
    try {
        if (!context?.params) {
            throw new Error('Missing params');
        }
        const { id } = await context.params;
        const invoice = await findInvoiceById(id);
        if (!invoice) {
            throw new NotFoundError('Invoice');
        }

        // Update status to Pending when sent
        const updated = await updateInvoice(id, { status: 'Pending' });
        if (!updated) {
            throw new NotFoundError('Invoice');
        }

        // TODO: Implement actual email sending here
        // For now, just update the status

        return NextResponse.json({
            success: true,
            data: invoiceToResponse(updated),
            message: `Invoice sent successfully`,
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

export const POST = requireAuth(postHandler);

