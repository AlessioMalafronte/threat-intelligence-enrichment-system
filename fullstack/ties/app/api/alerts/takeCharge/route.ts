import { NextResponse, NextRequest } from 'next/server';
import db from '../../../../config/db';
import jwt from 'jsonwebtoken';
import { AuthPayload } from '../../../../types/User';
import { RowDataPacket } from 'mysql2/promise';

/**
 * Endpoint per permettere a un analista di prendere in carico un avviso.
 * Aggiorna lo stato, il timestamp e l'ID dell'analista nella tabella `work`.
 */
export async function POST(req: NextRequest) {
    const user_token = req.cookies.get('user_token')?.value;

    if (!user_token) {
        return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    try {
        const decoded = jwt.verify(user_token, process.env.JWT_SECRET!) as AuthPayload;
        const { id, company, role } = decoded;

        // Gestione del caso in cui la richiesta non ha un corpo JSON
        const body = await req.text();
        console.log("Take charge:", body);
        if (!body) {
            console.error('La richiesta ha un corpo vuoto.');
            return NextResponse.json({ message: 'Request body is empty' }, { status: 400 });
        }
        const { alertId } = JSON.parse(body);

        if (!id) {
            return NextResponse.json({ message: 'User is not a SOC analyst' }, { status: 403 });
        }

        // Verifica lo stato corrente dell'avviso
        const [rows] = await db.execute<RowDataPacket[]>(
            `SELECT status, company FROM work WHERE reference_alert_id = ?`,
            [alertId]
        );

        if (rows.length === 0) {
            return NextResponse.json({ message: 'Alert not found' }, { status: 404 });
        }

        const alertWork = rows[0];

        if (alertWork.company !== company) {
            return NextResponse.json({ message: 'Unauthorized: alert belongs to a different company' }, { status: 403 });
        }

        if (alertWork.status !== 0) {
            return NextResponse.json({ message: 'Alert is already taken or resolved' }, { status: 409 });
        }

        // Aggiorna lo stato dell'avviso a "preso in carico"
        await db.execute(
            `UPDATE work 
             SET status = ?, taken_ts = NOW(), soc_id = ? 
             WHERE reference_alert_id = ?`,
            [1, id, alertId]
        );

        return NextResponse.json({ message: 'Alert taken charge of successfully' }, { status: 200 });

    } catch (error) {
        console.error('Take charge error:', error);
        return NextResponse.json(
            { message: 'Internal server error: ' + (error as Error).message },
            { status: 500 }
        );
    }
}