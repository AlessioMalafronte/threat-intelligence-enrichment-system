import { NextResponse, NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { AuthPayload } from '../../../../types/User';

/**
 * Gestisce le richieste GET per la route /api/user/info.
 * Questa route verifica il token JWT dell'utente per determinare il suo ruolo
 * e lo restituisce al frontend.
 *
 * @returns {NextResponse} Una risposta JSON contenente lo stato e il ruolo dell'utente.
 */
export async function GET(req: NextRequest) {
  // Leggi il token JWT dai cookie della richiesta
  const user_token = req.cookies.get('user_token')?.value;

  if (!user_token) {
    // Se il token non esiste, l'utente non è autenticato
    return NextResponse.json({ message: 'User not authenticated' }, { status: 401 });
  }

  try {
    // Verifica e decodifica il token JWT
    const decoded = jwt.verify(user_token, process.env.JWT_SECRET!) as AuthPayload;

    // L'ID dell'azienda è opzionale e sarà presente solo per gli editor
    const companyId = decoded.company || null; 
    
    // Risposta di successo con il ruolo, l'ID azienda e l'ID utente
    return NextResponse.json({
      id: decoded.id, // Aggiunto l'ID dell'utente
      role: decoded.role,
      company: companyId,
      email: decoded.email,
      status: 'success'
    }, { status: 200 });

  } catch (error) {
    console.error('Authentication token error:', error);
    // Se il token non è valido o è scaduto, restituisci un errore 401
    return NextResponse.json({ message: 'Authentication failed' }, { status: 401 });
  }
}