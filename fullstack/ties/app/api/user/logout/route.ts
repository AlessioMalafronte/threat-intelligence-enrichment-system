import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try{
    const response = NextResponse.json({ message: 'Login successfull.' }, { status: 200 });
        response.cookies.delete('user_token');
    
        return response;

  } 
  catch (error) 
  {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}