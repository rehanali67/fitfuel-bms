import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/lib/middleware';
import { findAllCategories, createCategory, categoryToResponse } from '@/lib/models/Category';
import { handleError } from '@/lib/errors';
import { z } from 'zod';

const categorySchema = z.object({
    name: z.string().min(1, 'Category name is required'),
});

async function getHandler(request: AuthenticatedRequest) {
    try {
        const categories = await findAllCategories();

        return NextResponse.json({
            success: true,
            data: categories.map(categoryToResponse),
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

async function postHandler(request: AuthenticatedRequest) {
    try {
        const body = await request.json();
        const validatedData = categorySchema.parse(body);

        const category = await createCategory({
            name: validatedData.name.trim(),
        });

        return NextResponse.json({
            success: true,
            data: categoryToResponse(category),
        }, { status: 201 });
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
export const POST = requireAuth(postHandler);
