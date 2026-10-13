import { NextResponse, NextRequest } from 'next/server';
import db from '../../../../config/db';
import jwt from 'jsonwebtoken';
import { AuthPayload } from '../../../../types/User';
import { RowDataPacket } from 'mysql2/promise';

/**
 * Endpoint per recuperare tutti gli avvisi basati sull'azienda dell'utente loggato.
 * Restituisce i dati degli avvisi uniti allo stato di gestione della tabella `work`.
 */
export async function GET(req: NextRequest) {
    const user_token = req.cookies.get('user_token')?.value;

    if (!user_token) {
        return NextResponse.json({ message: 'User not authenticated' }, { status: 401 });
    }

    try {
        const decoded = jwt.verify(user_token, process.env.JWT_SECRET!) as AuthPayload;
        const companyId = decoded.company;

        if (!companyId) {
            return NextResponse.json({ message: 'User does not belong to a company' }, { status: 403 });
        }

        const [rows] = await db.execute<RowDataPacket[]>(
            `SELECT 
                a.id, a.timestamp, a.rule, a.category, a.severity, a.enrichment, a.raw_data,
                w.status, w.soc_id, w.taken_ts, w.resolved_ts, w.report
            FROM alerts a
            JOIN work w ON a.id = w.reference_alert_id
            WHERE w.company = ?
            ORDER BY a.timestamp DESC
            LIMIT 100`,
            [companyId]
        );

        const alerts = rows.map((row: any) => {
            let raw = row.raw_data || {};
            const resultData = raw.result || {};
            raw = { ...raw, ...resultData };
            delete raw.result;

            return {
                id: row.id,
                timestamp: new Date(row.timestamp).toISOString(),
                rule: row.rule,
                category: row.category,
                severity: row.severity,
                enrichment: row.enrichment,
                raw_data: raw,
                status: row.status,
                soc_id: row.soc_id,
                taken_ts: row.taken_ts ? new Date(row.taken_ts).toISOString() : null,
                resolved_ts: row.resolved_ts ? new Date(row.resolved_ts).toISOString() : null,
                report: row.report,
                isTakingCharge: false,
                isResolving: false,
            };
        });

        return NextResponse.json(alerts, { status: 200 });
    } catch (error) {
        console.error('Failed to fetch alerts:', error);
        return NextResponse.json(
            { message: 'Database error: ' + (error as Error).message },
            { status: 500 }
        );
    }
}