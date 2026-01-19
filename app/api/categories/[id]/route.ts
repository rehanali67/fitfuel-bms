import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/lib/middleware';
import { findCategoryById, updateCategory, deleteCategory, categoryToResponse } from '@/lib/models/Category';
import { handleError, NotFoundError } from '@/lib/errors';
import { z } from 'zod';

const categorySchema = z.object({
    name: z.string().min(1, 'Category name is required'),
});

async function putHandler(request: AuthenticatedRequest, context?: { params: Promise<{ id: string }> }) {
    try {
        if (!context?.params) {
            throw new Error('Missing params');
        }
        const { id } = await context.params;
        const category = await findCategoryById(id);
        if (!category) {
            throw new NotFoundError('Category');
        }

        const body = await request.json();
        const validatedData = categorySchema.parse(body);

        const updated = await updateCategory(id, {
            name: validatedData.name.trim(),
        });
        if (!updated) {
            throw new NotFoundError('Category');
        }

        return NextResponse.json({
            success: true,
            data: categoryToResponse(updated),
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

async function deleteHandler(request: AuthenticatedRequest, context?: { params: Promise<{ id: string }> }) {
    try {
        if (!context?.params) {
            throw new Error('Missing params');
        }
        const { id } = await context.params;
        const category = await findCategoryById(id);
        if (!category) {
            throw new NotFoundError('Category');
        }

        const deleted = await deleteCategory(id);
        if (!deleted) {
            throw new NotFoundError('Category');
        }

        return NextResponse.json({
            success: true,
            message: 'Category deleted successfully',
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

export const PUT = requireAuth(putHandler);
export const DELETE = requireAuth(deleteHandler);
