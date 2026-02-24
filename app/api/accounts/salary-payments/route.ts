import { NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/lib/middleware';
import {
    getSalaryPayments,
    createSalaryPayment,
    salaryPaymentToResponse,
} from '@/lib/models/SalaryPayment';
import { findUserById } from '@/lib/models/User';
import { handleError, AuthorizationError, NotFoundError } from '@/lib/errors';
import { z } from 'zod';

const createPaymentSchema = z.object({
    employeeId: z.string().min(1, 'Employee ID is required'),
    amount: z.number().positive('Amount must be positive'),
    paymentDate: z.string().optional(), // ISO date string, defaults to today
    month: z.number().int().min(1).max(12),
    year: z.number().int().min(2000),
    notes: z.string().optional(),
});

async function getHandler(request: AuthenticatedRequest) {
    try {
        if (request.user?.role !== 'admin') {
            throw new AuthorizationError('Only admins can view salary payments');
        }

        const { searchParams } = new URL(request.url);
        const employeeId = searchParams.get('employeeId') || undefined;
        const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined;
        const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : undefined;

        const payments = await getSalaryPayments(employeeId, year, month);

        return NextResponse.json({
            success: true,
            data: payments.map(salaryPaymentToResponse),
        });
    } catch (error) {
        const { statusCode, message } = handleError(error);
        return NextResponse.json({ success: false, error: message }, { status: statusCode });
    }
}

async function postHandler(request: AuthenticatedRequest) {
    try {
        if (request.user?.role !== 'admin') {
            throw new AuthorizationError('Only admins can record salary payments');
        }

        const body = await request.json();
        const data = createPaymentSchema.parse(body);

        // Validate user exists
        const user = await findUserById(data.employeeId);
        if (!user) throw new NotFoundError('User');

        const payment = await createSalaryPayment({
            employeeId: data.employeeId,
            employeeName: user.name,
            amount: data.amount,
            paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
            month: data.month,
            year: data.year,
            notes: data.notes,
        });

        return NextResponse.json(
            { success: true, data: salaryPaymentToResponse(payment) },
            { status: 201 }
        );
    } catch (error) {
        const { statusCode, message, errors } = handleError(error);
        return NextResponse.json({ success: false, error: message, errors }, { status: statusCode });
    }
}

export const GET = requireAuth(getHandler);
export const POST = requireAuth(postHandler);
