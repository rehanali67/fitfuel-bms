import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    // JWT is stateless, so logout is handled client-side by removing the token
    // This endpoint exists for consistency and potential future server-side token blacklisting
    return NextResponse.json({
        success: true,
        message: 'Logged out successfully',
    });
}

