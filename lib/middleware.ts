import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader, JWTPayload } from './auth';
import { AuthenticationError, AuthorizationError, handleError } from './errors';

export interface AuthenticatedRequest extends NextRequest {
    user?: JWTPayload;
}

export async function authenticateRequest(request: NextRequest): Promise<JWTPayload> {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
        throw new AuthenticationError('No token provided');
    }

    try {
        const payload = verifyToken(token);
        return payload;
    } catch (error) {
        throw new AuthenticationError('Invalid or expired token');
    }
}

export function requireAuth<T extends { params?: Promise<{ [key: string]: string }> }>(
    handler: (req: AuthenticatedRequest, context?: T) => Promise<NextResponse>
): (request: NextRequest, context?: T) => Promise<NextResponse> {
    return async (request: NextRequest, context?: T) => {
        try {
            const user = await authenticateRequest(request);
            (request as AuthenticatedRequest).user = user;
            return handler(request as AuthenticatedRequest, context);
        } catch (error) {
            const { statusCode, message } = handleError(error);
            return NextResponse.json(
                { success: false, error: message },
                { status: statusCode }
            );
        }
    };
}

export function requireRole(allowedRoles: string[]) {
    return (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => {
        return async (request: AuthenticatedRequest) => {
            try {
                const user = await authenticateRequest(request);

                if (!allowedRoles.includes(user.role)) {
                    throw new AuthorizationError();
                }

                request.user = user;
                return handler(request);
            } catch (error) {
                const { statusCode, message } = handleError(error);
                return NextResponse.json(
                    { success: false, error: message },
                    { status: statusCode }
                );
            }
        };
    };
}

