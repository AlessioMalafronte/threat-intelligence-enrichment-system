import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../config/db';
import { RowDataPacket } from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import { AuthPayload, User } from '../../../../types/User';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('user_token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;
    const userRole = decoded.role;
    let users;

    if (userRole === 'admin') {
      const [editorUsers] = await db.execute<RowDataPacket[]>(
        `SELECT u.id, u.username, u.email, u.role, c.name as company_name 
         FROM users u
         JOIN company c ON u.company = c.id
         WHERE u.role = ?;`,
        ['editor']
      );
      users = editorUsers;
    } else if (userRole === 'editor') {
      const [regularUsers] = await db.execute<RowDataPacket[]>(
        `SELECT u.id, u.username, u.email, u.role, c.name as company_name 
         FROM users u
         JOIN company c ON u.company = c.id
         WHERE u.role = ?;`,
        ['user']
      );
      users = regularUsers;
    } else {
      return NextResponse.json({ message: 'Unauthorized access' }, { status: 403 });
    }

    return NextResponse.json(users, { status: 200 });

  } catch (error) {
    console.error('Error in user management API:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}