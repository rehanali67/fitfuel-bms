import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/lib/middleware';
import { getCompany, updateCompany, companyToResponse } from '@/lib/models/Company';
import { handleError } from '@/lib/errors';
import { z } from 'zod';

const companySchema = z.object({
    name: z.string().min(1, 'Company name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(1, 'Phone is required'),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    zipCode: z.string().optional(),
});

async function getHandler(request: AuthenticatedRequest) {
    try {
        const company = await getCompany();
        
        if (!company) {
            return NextResponse.json({
                success: true,
                data: null,
            });
        }

        return NextResponse.json({
            success: true,
            data: companyToResponse(company),
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

async function putHandler(request: AuthenticatedRequest) {
    try {
        const body = await request.json();
        const validatedData = companySchema.parse(body);

        const company = await updateCompany(validatedData);

        return NextResponse.json({
            success: true,
            data: companyToResponse(company),
            message: 'Company information updated successfully',
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

export const GET = requireAuth(getHandler);
export const PUT = requireAuth(putHandler);

