import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/lib/middleware';
import { findQuotationById, updateQuotation, quotationToResponse } from '@/lib/models/Quotation';
import { handleError, NotFoundError } from '@/lib/errors';

async function postHandler(request: AuthenticatedRequest, context?: { params: Promise<{ id: string }> }) {
    try {
        if (!context?.params) {
            throw new Error('Missing params');
        }
        const { id } = await context.params;
        const quotation = await findQuotationById(id);
        if (!quotation) {
            throw new NotFoundError('Quotation');
        }

        // Update status to Sent when sent
        const updated = await updateQuotation(id, { status: 'Sent' });
        if (!updated) {
            throw new NotFoundError('Quotation');
        }

        // TODO: Implement actual email sending here
        // For now, just update the status

        return NextResponse.json({
            success: true,
            data: quotationToResponse(updated),
            message: `Quotation sent to ${quotation.clientName}`,
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

