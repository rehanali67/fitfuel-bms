import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/lib/validation';
import { comparePassword, generateToken } from '@/lib/auth';
import { findUserByEmail, userToResponse } from '@/lib/models/User';
import { handleError, ValidationError, AuthenticationError } from '@/lib/errors';
import { LoginResponse } from '@/types/api';
import clientPromise from '@/lib/mongodb';

export async function POST(request: NextRequest) {
    try {
        // Ensure database connection
        try {
            await clientPromise;
        } catch (dbError) {
            console.error('Database connection error:', dbError);
            return NextResponse.json(
                {
                    success: false,
                    error: 'Database connection failed. Please check your MongoDB URI.',
                },
                { status: 500 }
            );
        }

        let body;
        try {
            body = await request.json();
        } catch (parseError) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid request body. Expected JSON.',
                },
                { status: 400 }
            );
        }

        const validatedData = loginSchema.parse(body);

        const user = await findUserByEmail(validatedData.email);
        if (!user) {
            throw new AuthenticationError('Invalid email or password');
        }

        if (!user.password) {
            throw new AuthenticationError('Invalid email or password');
        }

        const isPasswordValid = await comparePassword(validatedData.password, user.password);
        if (!isPasswordValid) {
            throw new AuthenticationError('Invalid email or password');
        }

        const token = generateToken({
            userId: user._id!.toString(),
            email: user.email,
            role: user.role,
        });

        const response: LoginResponse = {
            user: userToResponse(user),
            token,
        };

        return NextResponse.json({
            success: true,
            data: response,
        });
    } catch (error) {
        console.error('Login error:', error);
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

