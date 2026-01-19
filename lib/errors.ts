export class AppError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public isOperational = true
    ) {
        super(message);
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

export class ValidationError extends AppError {
    constructor(message: string, public errors?: any) {
        super(400, message);
        this.name = 'ValidationError';
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string = 'Authentication failed') {
        super(401, message);
        this.name = 'AuthenticationError';
    }
}

export class AuthorizationError extends AppError {
    constructor(message: string = 'You do not have permission to perform this action') {
        super(403, message);
        this.name = 'AuthorizationError';
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string = 'Resource') {
        super(404, `${resource} not found`);
        this.name = 'NotFoundError';
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super(409, message);
        this.name = 'ConflictError';
    }
}

export function handleError(error: unknown): { statusCode: number; message: string; errors?: any } {
    if (error instanceof AppError) {
        return {
            statusCode: error.statusCode,
            message: error.message,
            errors: error instanceof ValidationError ? error.errors : undefined,
        };
    }

    if (error instanceof Error) {
        console.error('Unexpected error:', error);
        return {
            statusCode: 500,
            message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
        };
    }

    return {
        statusCode: 500,
        message: 'An unexpected error occurred',
    };
}

