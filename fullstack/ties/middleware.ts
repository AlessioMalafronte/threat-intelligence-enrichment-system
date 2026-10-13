// middleware.ts
import { NextResponse, NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(request: NextRequest) {
  // Ottieni il token dal cookie della richiesta
  const token = request.cookies.get('user_token')?.value;

  // Definisci le pagine pubbliche che non richiedono autenticazione
  const publicPaths = ['/login', '/api/user/login', '/login/google.webp'];

  // Controlla se il percorso attuale è pubblico
  const isPublicPath = publicPaths.includes(request.nextUrl.pathname);

  // Se l'utente sta cercando di accedere a una pagina pubblica e ha già un token,
  // reindirizzalo alla dashboard per evitare che si logghi di nuovo
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Se l'utente sta cercando di accedere a una pagina privata e non ha un token,
  // reindirizzalo alla pagina di login
  if (!token && !isPublicPath) {
    // Reindirizza se non è già sulla pagina di login per evitare loop infiniti
    if (request.nextUrl.pathname !== '/login') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Se tutto è a posto, continua con la richiesta
  return NextResponse.next();
}

export const config = {
  // Definisci quali percorsi devono essere gestiti da questo middleware
  // Regex per escludere i file statici, i font, ecc.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|google.svg|.*\\.png$).*)'],
};