import { NextResponse, NextRequest } from 'next/server';
import db from '../../../../config/db';
import jwt from 'jsonwebtoken';
import { AuthPayload } from '../../../../types/User';
import { RowDataPacket } from 'mysql2/promise';

/**
 * Endpoint per permettere a un analista di marcare un avviso come risolto.
 * Aggiorna lo stato, il timestamp e il report di chiusura nella tabella `work`.
 */
export async function POST(req: NextRequest) {
    const user_token = req.cookies.get('user_token')?.value;

    if (!user_token) {
        return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    try {
        const decoded = jwt.verify(user_token, process.env.JWT_SECRET!) as AuthPayload;
        const { id, company, role } = decoded;

        const { alertId, report } = await req.json();


        // Verifica lo stato corrente e l'ID dell'analista
        const [rows] = await db.execute<RowDataPacket[]>(
            `SELECT status, soc_id, company FROM work WHERE reference_alert_id = ?`,
            [alertId]
        );

        if (rows.length === 0) {
            return NextResponse.json({ message: 'Alert not found' }, { status: 404 });
        }

        const alertWork = rows[0];

        if (alertWork.company !== company) {
            return NextResponse.json({ message: 'Unauthorized: alert belongs to a different company' }, { status: 403 });
        }
        
        if (alertWork.soc_id !== id) {
            return NextResponse.json({ message: 'Unauthorized: You are not assigned to this alert' }, { status: 403 });
        }

        if (alertWork.status !== 1) {
            return NextResponse.json({ message: 'Alert is not in a "taken" state' }, { status: 409 });
        }

        // Aggiorna lo stato dell'avviso a "risolto"
        await db.execute(
            `UPDATE work 
             SET status = ?, resolved_ts = NOW(), report = ?
             WHERE reference_alert_id = ?`,
            [2, JSON.stringify(report), alertId]
        );

        return NextResponse.json({ message: 'Alert resolved successfully' }, { status: 200 });

    } catch (error) {
        console.error('Mark resolved error:', error);
        return NextResponse.json(
            { message: 'Internal server error: ' + (error as Error).message },
            { status: 500 }
        );
    }
}