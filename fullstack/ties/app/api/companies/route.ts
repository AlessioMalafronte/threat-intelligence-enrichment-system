import { NextRequest, NextResponse } from 'next/server';
import db from '../../../config/db';
import { RowDataPacket } from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import { AuthPayload } from '../../../types/User';

// GET: Recupera tutte le aziende
export async function GET(req: NextRequest) {
  const token = req.cookies.get('user_token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;
    if (decoded.role !== 'admin' && decoded.role !== 'editor') {
      return NextResponse.json({ message: 'Unauthorized access' }, { status: 403 });
    }

    const [companies] = await db.execute<RowDataPacket[]>(
      'SELECT id, name, p_iva, vip FROM company;'
    );

    return NextResponse.json(companies, { status: 200 });

  } catch (error) {
    console.error('Error in companies API:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Crea una nuova azienda (solo per admin)
export async function POST(req: NextRequest) {
  const token = req.cookies.get('user_token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;
    if (decoded.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized access' }, { status: 403 });
    }

    const { name, p_iva, vip } = await req.json();

    if (!name || !p_iva) {
      return NextResponse.json({ message: 'Missing required fields: name, p_iva.' }, { status: 400 });
    }

    await db.execute(
      'INSERT INTO company (name, p_iva, vip) VALUES (?, ?, ?);',
      [name, p_iva, vip]
    );

    return NextResponse.json({ message: 'Company created successfully.' }, { status: 201 });

  } catch (error) {
    console.error('Error creating company:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}