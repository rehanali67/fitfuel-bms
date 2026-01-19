import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/lib/middleware';
import { findUserById, userToResponse } from '@/lib/models/User';
import { handleError, NotFoundError } from '@/lib/errors';

async function handler(request: AuthenticatedRequest) {
    try {
        if (!request.user) {
            throw new Error('User not found in request');
        }

        const user = await findUserById(request.user.userId);
        if (!user) {
            throw new NotFoundError('User');
        }

        return NextResponse.json({
            success: true,
            data: userToResponse(user),
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

export const GET = requireAuth(handler);

