import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/lib/middleware';
import { getInvoiceCollection } from '@/lib/models/Invoice';
import { getQuotationCollection } from '@/lib/models/Quotation';
import { getProductCollection } from '@/lib/models/Product';
import { handleError } from '@/lib/errors';
import { Activity } from '@/types/api';

async function getHandler(request: AuthenticatedRequest) {
    try {
        const invoiceCollection = await getInvoiceCollection();
        const quotationCollection = await getQuotationCollection();
        const productCollection = await getProductCollection();

        const activities: Activity[] = [];

        // Get recent invoices (last 10, sorted by updatedAt)
        const recentInvoices = await invoiceCollection
            .find({})
            .sort({ updatedAt: -1 })
            .limit(10)
            .toArray();

        // Get recent quotations (last 10, sorted by updatedAt)
        const recentQuotations = await quotationCollection
            .find({})
            .sort({ updatedAt: -1 })
            .limit(10)
            .toArray();

        // Get low stock products
        const lowStockProducts = await productCollection
            .find({
                $or: [
                    { status: 'Low Stock' },
                    { status: 'Out of Stock' }
                ]
            })
            .sort({ updatedAt: -1 })
            .limit(5)
            .toArray();

        // Process invoices into activities
        recentInvoices.forEach((invoice) => {
            const paymentMethodLabels: Record<string, string> = {
                'cash': 'Cash',
                'card': 'Card',
                'bank-transfer': 'Bank Transfer',
                'Fawran': 'Fawran',
                'Pending': 'Pending',
            };

            const paymentMethod = invoice.paymentMethod || 'N/A';
            const paymentMethodLabel = paymentMethodLabels[paymentMethod] || paymentMethod;
            
            activities.push({
                id: `invoice-${invoice._id}`,
                type: 'invoice',
                action: paymentMethod,
                description: `Invoice ${invoice.invoiceNumber} - Payment: ${paymentMethodLabel}`,
                timestamp: (invoice.updatedAt || invoice.createdAt).toISOString(),
                color: 'blue' as const,
                link: `/dashboard/invoices/${invoice._id!.toString()}`,
            });
        });

        // Process quotations into activities
        recentQuotations.forEach((quotation) => {
            const statusMessages: Record<string, { message: string; color: Activity['color'] }> = {
                'Accepted': { message: 'was accepted', color: 'green' },
                'Declined': { message: 'was declined', color: 'red' },
                'Sent': { message: 'was sent', color: 'blue' },
                'Expired': { message: 'has expired', color: 'orange' },
                'Draft': { message: 'was created', color: 'purple' },
            };

            const statusInfo = statusMessages[quotation.status] || { message: 'was updated', color: 'purple' as const };
            
            activities.push({
                id: `quotation-${quotation._id}`,
                type: 'quotation',
                action: quotation.status,
                description: `Quotation ${quotation.quotationNumber} ${statusInfo.message}${quotation.clientName ? ` for ${quotation.clientName}` : ''}`,
                timestamp: (quotation.updatedAt || quotation.createdAt).toISOString(),
                color: statusInfo.color,
                link: `/dashboard/quotations/${quotation._id!.toString()}`,
            });
        });

        // Process low stock alerts
        lowStockProducts.forEach((product) => {
            activities.push({
                id: `inventory-${product._id}`,
                type: 'inventory',
                action: product.status,
                description: `Low stock alert for ${product.name}`,
                timestamp: (product.updatedAt || product.createdAt).toISOString(),
                color: product.status === 'Out of Stock' ? 'red' : 'orange',
                link: `/dashboard/inventory/${product._id!.toString()}`,
            });
        });

        // Sort all activities by timestamp (most recent first) and limit to 10
        activities.sort((a, b) => {
            const timeA = new Date(a.timestamp).getTime();
            const timeB = new Date(b.timestamp).getTime();
            return timeB - timeA;
        });

        return NextResponse.json({
            success: true,
            data: activities.slice(0, 10), // Return top 10 most recent
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

