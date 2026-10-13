import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../config/db';
import bcrypt from 'bcryptjs';
import { RowDataPacket } from 'mysql2/promise';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
    const { email, password } = await req.json();

    try {
        const [rows] = await db.execute<RowDataPacket[]>(
            'SELECT id, email, password_hash, role, company FROM users WHERE email = ?;',
            [email]
        );

        if (rows.length === 0) {
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        }

        const user = rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        }
        
        let payload: { id: number, email: string, role: string, company?: number | null } = {
            id: user.id,
            email: user.email,
            role: user.role,
            company: user.company
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET!, {
            expiresIn: '1h',
        });

        const response = NextResponse.json({ message: 'Login successful' }, { status: 200 });
        response.cookies.set('user_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
    }
}