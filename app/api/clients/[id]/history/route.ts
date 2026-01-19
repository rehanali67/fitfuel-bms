import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/lib/middleware';
import { findClientById } from '@/lib/models/Client';
import { getInvoiceCollection } from '@/lib/models/Invoice';
import { getQuotationCollection } from '@/lib/models/Quotation';
import { handleError, NotFoundError } from '@/lib/errors';
import { ObjectId } from 'mongodb';

async function getHandler(request: AuthenticatedRequest, context?: { params?: Promise<{ id: string }> }) {
    try {
        if (!context?.params) {
            throw new NotFoundError('Client');
        }
        const { id } = await context.params;
        const client = await findClientById(id);
        if (!client) {
            throw new NotFoundError('Client');
        }

        const invoiceCollection = await getInvoiceCollection();
        const quotationCollection = await getQuotationCollection();

        // Fetch invoices and quotations for this client
        // Search by both clientId (string) and clientName (for backward compatibility)
        const [invoices, quotations] = await Promise.all([
            invoiceCollection.find({ 
                $or: [
                    { clientId: id },
                    { clientName: client.name }
                ]
            }).sort({ createdAt: -1 }).toArray(),
            quotationCollection.find({ 
                $or: [
                    { clientId: id },
                    { clientName: client.name }
                ]
            }).sort({ createdAt: -1 }).toArray(),
        ]);

        // Combine and format history
        const history = [
            ...invoices.map(inv => ({
                id: inv._id!.toString(),
                type: 'invoice' as const,
                number: inv.invoiceNumber,
                date: inv.issueDate,
                amount: inv.total,
                status: inv.status,
                createdAt: inv.createdAt,
            })),
            ...quotations.map(quot => ({
                id: quot._id!.toString(),
                type: 'quotation' as const,
                number: quot.quotationNumber,
                date: quot.issueDate,
                amount: quot.total,
                status: quot.status,
                createdAt: quot.createdAt,
            })),
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json({
            success: true,
            data: history,
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

