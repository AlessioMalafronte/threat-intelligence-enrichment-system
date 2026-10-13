import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../config/db';
import bcrypt from 'bcryptjs';
import { RowDataPacket } from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import { AuthPayload } from '../../../../types/User';

export async function POST(req: NextRequest) {
  // Cambiato da 'token' a 'user_token'
  const user_token = req.cookies.get('user_token')?.value;

  if (!user_token) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(user_token, process.env.JWT_SECRET!) as AuthPayload;

    // L'admin può creare un editor con azienda specificata
    if (decoded.role === 'admin') {
      const { username, email, password, company } = await req.json();

      if (!username || !email || !password || company === undefined) {
        return NextResponse.json({ message: 'Missing fields: username, email, password, and company are required.' }, { status: 400 });
      }

      const [existingUsers] = await db.execute<RowDataPacket[]>(
        'SELECT id FROM users WHERE email = ? OR username = ?;',
        [email, username]
      );
      if (existingUsers.length > 0) {
        return NextResponse.json({ message: 'User with this email or username already exists.' }, { status: 409 });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await db.execute(
        'INSERT INTO users (username, email, password_hash, company, role) VALUES (?, ?, ?, ?, ?);',
        [username, email, hashedPassword, company, 'editor']
      );

      return NextResponse.json({ message: 'Editor created successfully.' }, { status: 201 });
    } 
    // L'editor può creare un utente solo della sua azienda
    else if (decoded.role === 'editor') {
      const { username, email, password } = await req.json();

      if (!username || !email || !password) {
        return NextResponse.json({ message: 'Missing fields: username, email, and password are required.' }, { status: 400 });
      }
      
      const [existingUsers] = await db.execute<RowDataPacket[]>(
        'SELECT id FROM users WHERE email = ? OR username = ?;',
        [email, username]
      );
      if (existingUsers.length > 0) {
        return NextResponse.json({ message: 'User with this email or username already exists.' }, { status: 409 });
      }

      // L'azienda del nuovo utente è l'azienda dell'editor loggato
      const company = decoded.company;
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await db.execute(
        'INSERT INTO users (username, email, password_hash, company, role) VALUES (?, ?, ?, ?, ?);',
        [username, email, hashedPassword, company, 'user']
      );

      return NextResponse.json({ message: 'User created successfully.' }, { status: 201 });
    } else {
      return NextResponse.json({ message: 'Unauthorized access' }, { status: 403 });
    }

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}