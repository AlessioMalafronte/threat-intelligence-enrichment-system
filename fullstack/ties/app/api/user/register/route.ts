// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../config/db';
import bcrypt from 'bcryptjs';
import { RowDataPacket } from 'mysql2/promise';

export async function POST(req: NextRequest) {
  const { username, email, password } = await req.json();

  // Verifica se i campi obbligatori sono presenti
  if (!username || !email || !password) {
    return NextResponse.json({ message: 'Missing fields: username, email, and password are required.' }, { status: 400 });
  }

  try {
    // 1. Controlla se l'utente esiste già
    const [existingUsers] = await db.execute<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUsers.length > 0) {
      return NextResponse.json({ message: 'User with this email or username already exists.' }, { status: 409 });
    }

    // 2. Hasha la password prima di salvarla nel database
    const hashedPassword = await bcrypt.hash(password, 10); // Il valore 10 è il "salt round"

    // 3. Inserisci il nuovo utente nel database
    await db.execute(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    return NextResponse.json({ message: 'User registered successfully.' }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}