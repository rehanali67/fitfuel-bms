import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/lib/middleware';
import { getInvoiceCollection, invoiceToResponse } from '@/lib/models/Invoice';
import { handleError } from '@/lib/errors';

async function getHandler(request: AuthenticatedRequest) {
    try {
        const collection = await getInvoiceCollection();
        const invoices = await collection
            .find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .toArray();

        return NextResponse.json({
            success: true,
            data: invoices.map(invoiceToResponse),
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

