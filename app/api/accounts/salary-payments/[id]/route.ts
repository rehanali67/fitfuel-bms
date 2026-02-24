import { NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/lib/middleware';
import { deleteSalaryPayment, getSalaryPaymentCollection, salaryPaymentToResponse } from '@/lib/models/SalaryPayment';
import { handleError, AuthorizationError, NotFoundError } from '@/lib/errors';
import { ObjectId } from 'mongodb';

async function getHandler(
    request: AuthenticatedRequest,
    context?: { params?: Promise<{ id: string }> }
) {
    try {
        if (request.user?.role !== 'admin') throw new AuthorizationError('Admins only');
        if (!context?.params) throw new NotFoundError('Payment');
        const { id } = await context.params;
        const col = await getSalaryPaymentCollection();
        const doc = await col.findOne({ _id: new ObjectId(id) });
        if (!doc) throw new NotFoundError('Salary payment');
        return NextResponse.json({ success: true, data: salaryPaymentToResponse(doc) });
    } catch (error) {
        const { statusCode, message } = handleError(error);
        return NextResponse.json({ success: false, error: message }, { status: statusCode });
    }
}

async function deleteHandler(
    request: AuthenticatedRequest,
    context?: { params?: Promise<{ id: string }> }
) {
    try {
        if (request.user?.role !== 'admin') throw new AuthorizationError('Admins only');
        if (!context?.params) throw new NotFoundError('Payment');
        const { id } = await context.params;

        const deleted = await deleteSalaryPayment(id);
        if (!deleted) throw new NotFoundError('Salary payment');

        return NextResponse.json({ success: true, message: 'Payment deleted successfully' });
    } catch (error) {
        const { statusCode, message } = handleError(error);
        return NextResponse.json({ success: false, error: message }, { status: statusCode });
    }
}

export const GET = requireAuth(getHandler);
export const DELETE = requireAuth(deleteHandler);
