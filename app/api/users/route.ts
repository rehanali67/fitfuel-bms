import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/lib/middleware';
import { getAllUsers, createUser, findUserByEmail, userToResponse } from '@/lib/models/User';
import { hashPassword } from '@/lib/auth';
import { handleError, AuthorizationError, ConflictError } from '@/lib/errors';
import { z } from 'zod';

const createUserSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['admin', 'manager', 'user']).default('user'),
});

async function getHandler(request: AuthenticatedRequest) {
    try {
        if (request.user?.role !== 'admin') {
            throw new AuthorizationError('Only admins can view users');
        }

        const users = await getAllUsers();

        return NextResponse.json({
            success: true,
            data: users.map(userToResponse),
        });
    } catch (error) {
        const { statusCode, message } = handleError(error);
        return NextResponse.json({ success: false, error: message }, { status: statusCode });
    }
}

async function postHandler(request: AuthenticatedRequest) {
    try {
        if (request.user?.role !== 'admin') {
            throw new AuthorizationError('Only admins can create users');
        }

        const body = await request.json();
        const validatedData = createUserSchema.parse(body);

        // Check for duplicate email
        const existing = await findUserByEmail(validatedData.email);
        if (existing) {
            throw new ConflictError('A user with this email already exists');
        }

        const hashedPassword = await hashPassword(validatedData.password);

        const user = await createUser({
            name: validatedData.name,
            email: validatedData.email,
            password: hashedPassword,
            role: validatedData.role,
        });

        return NextResponse.json(
            { success: true, data: userToResponse(user) },
            { status: 201 }
        );
    } catch (error) {
        const { statusCode, message, errors } = handleError(error);
        return NextResponse.json({ success: false, error: message, errors }, { status: statusCode });
    }
}

export const GET = requireAuth(getHandler);
export const POST = requireAuth(postHandler);
