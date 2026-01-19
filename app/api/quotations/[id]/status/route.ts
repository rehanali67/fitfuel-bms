import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/lib/middleware';
import { findQuotationById, updateQuotation, quotationToResponse } from '@/lib/models/Quotation';
import { z } from 'zod';
import { handleError, NotFoundError } from '@/lib/errors';

const statusSchema = z.object({
    status: z.enum(['Draft', 'Sent', 'Accepted', 'Declined', 'Expired']),
});

async function patchHandler(request: AuthenticatedRequest, context?: { params: Promise<{ id: string }> }) {
    try {
        if (!context?.params) {
            throw new Error('Missing params');
        }
        const { id } = await context.params;
        const quotation = await findQuotationById(id);
        if (!quotation) {
            throw new NotFoundError('Quotation');
        }

        const body = await request.json();
        const validatedData = statusSchema.parse(body);

        const updated = await updateQuotation(id, { status: validatedData.status });
        if (!updated) {
            throw new NotFoundError('Quotation');
        }

        return NextResponse.json({
            success: true,
            data: quotationToResponse(updated),
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

export const PATCH = requireAuth(patchHandler);

