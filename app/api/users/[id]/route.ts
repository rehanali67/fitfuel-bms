import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/lib/middleware';
import { findUserById, updateUser, deleteUser, userToResponse, findUserByEmail } from '@/lib/models/User';
import { hashPassword } from '@/lib/auth';
import { handleError, AuthorizationError, NotFoundError, ConflictError } from '@/lib/errors';
import { z } from 'zod';

const updateUserSchema = z.object({
    name: z.string().min(1, 'Name is required').optional(),
    email: z.string().email('Invalid email address').optional(),
    role: z.enum(['admin', 'manager', 'user']).optional(),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

async function getHandler(
    request: AuthenticatedRequest,
    context?: { params?: Promise<{ id: string }> }
) {
    try {
        if (request.user?.role !== 'admin') {
            throw new AuthorizationError('Only admins can view users');
        }
        if (!context?.params) throw new NotFoundError('User');
        const { id } = await context.params;

        const user = await findUserById(id);
        if (!user) throw new NotFoundError('User');

        return NextResponse.json({ success: true, data: userToResponse(user) });
    } catch (error) {
        const { statusCode, message } = handleError(error);
        return NextResponse.json({ success: false, error: message }, { status: statusCode });
    }
}

async function putHandler(
    request: AuthenticatedRequest,
    context?: { params?: Promise<{ id: string }> }
) {
    try {
        if (request.user?.role !== 'admin') {
            throw new AuthorizationError('Only admins can update users');
        }
        if (!context?.params) throw new NotFoundError('User');
        const { id } = await context.params;

        const user = await findUserById(id);
        if (!user) throw new NotFoundError('User');

        const body = await request.json();
        const validatedData = updateUserSchema.parse(body);

        // Check email uniqueness if changing email
        if (validatedData.email && validatedData.email.toLowerCase() !== user.email) {
            const existing = await findUserByEmail(validatedData.email);
            if (existing) throw new ConflictError('A user with this email already exists');
        }

        const updates: any = { ...validatedData };

        // Hash new password if provided
        if (validatedData.password) {
            updates.password = await hashPassword(validatedData.password);
        }

        const updated = await updateUser(id, updates);
        if (!updated) throw new NotFoundError('User');

        return NextResponse.json({ success: true, data: userToResponse(updated) });
    } catch (error) {
        const { statusCode, message, errors } = handleError(error);
        return NextResponse.json({ success: false, error: message, errors }, { status: statusCode });
    }
}

async function deleteHandler(
    request: AuthenticatedRequest,
    context?: { params?: Promise<{ id: string }> }
) {
    try {
        if (request.user?.role !== 'admin') {
            throw new AuthorizationError('Only admins can delete users');
        }
        if (!context?.params) throw new NotFoundError('User');
        const { id } = await context.params;

        // Prevent self-deletion
        if (request.user?.userId === id) {
            throw new AuthorizationError('You cannot delete your own account');
        }

        const user = await findUserById(id);
        if (!user) throw new NotFoundError('User');

        const deleted = await deleteUser(id);
        if (!deleted) throw new NotFoundError('User');

        return NextResponse.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        const { statusCode, message } = handleError(error);
        return NextResponse.json({ success: false, error: message }, { status: statusCode });
    }
}

export const GET = requireAuth(getHandler);
export const PUT = requireAuth(putHandler);
export const DELETE = requireAuth(deleteHandler);
