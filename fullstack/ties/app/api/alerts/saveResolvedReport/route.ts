import { NextResponse, NextRequest } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import puppeteer from 'puppeteer';
import jwt from 'jsonwebtoken';
import db from '../../../../config/db';
import { AuthPayload } from '../../../../types/User';
import { RowDataPacket } from 'mysql2/promise';

export async function POST(req: NextRequest) {
    const user_token = req.cookies.get('user_token')?.value;
    if (!user_token) {
        return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    let decoded: AuthPayload;
    try {
        decoded = jwt.verify(user_token, process.env.JWT_SECRET!) as AuthPayload;
    } catch {
        return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
    }

    try {
        const { alertId, htmlContent } = await req.json();
        const id = Number(alertId);                                  // evita path traversal nel nome file
        if (!Number.isInteger(id) || id <= 0 || !htmlContent) {
            return NextResponse.json({ message: 'Dati di richiesta mancanti o non validi' }, { status: 400 });
        }

        const [rows] = await db.execute<RowDataPacket[]>(
            'SELECT company, soc_id, status FROM work WHERE reference_alert_id = ?',
            [id]
        );
        if (rows.length === 0) {
            return NextResponse.json({ message: 'Alert not found' }, { status: 404 });
        }
        const work = rows[0];
        if (work.company !== decoded.company || work.soc_id !== decoded.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }
        if (work.status !== 2) {                                     // report solo per alert risolti
            return NextResponse.json({ message: 'Alert is not resolved' }, { status: 409 });
        }

        const browser = await puppeteer.launch({ headless: true });
        try {
            const page = await browser.newPage();
            await page.setJavaScriptEnabled(false);                  // niente script nell'HTML del client
            await page.setRequestInterception(true);
            page.on('request', r => r.url().startsWith('data:') ? r.continue() : r.abort()); // blocca richieste di rete

            await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
            const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

            const publicPath = path.join(process.cwd(), 'public', 'reports');
            await fs.mkdir(publicPath, { recursive: true });
            await fs.writeFile(path.join(publicPath, `report-avviso-${id}.pdf`), pdfBuffer);
        } finally {
            await browser.close();                                   // chiude il browser anche in caso di errore
        }

        return NextResponse.json({ message: 'Report PDF salvato correttamente' }, { status: 200 });
    } catch (error) {
        console.error('Errore durante il salvataggio del report PDF:', error);
        return NextResponse.json({ message: 'Errore interno del server durante il salvataggio del report' }, { status: 500 });
    }
}