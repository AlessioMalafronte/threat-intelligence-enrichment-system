"use client";
import { useState, useEffect } from "react";
import { AlertData } from "@/types/AlertData";
import styles from "./siem.module.css";
import ListAlerts from "./list-alerts/page";
import ViewAlert from "./view-alert/page";
import ViewAlertRaw from "./view-alert-raw/page";
import { AuthPayload } from "@/types/User";

// Definiamo un'interfaccia per il tipo di dati dell'utente autenticato
interface UserInfo {
    role: string;
    socId: number | null;
    email: string;
}

export default function Siem() {
    const [alerts, setAlerts] = useState<AlertData[]>([]);
    const [currentAlert, setCurrentAlert] = useState<AlertData | undefined>(undefined);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUserAndAlerts = async () => {
        try {
            // 1. Recupera le informazioni dell'utente
            const userResponse = await fetch("/api/user/info");
            if (!userResponse.ok) {
                const errorData = await userResponse.json();
                throw new Error(errorData.message || "Failed to fetch user info.");
            }
            const userData: AuthPayload = await userResponse.json();
            setUserInfo({ role: userData.role, socId: userData.id || null, email: userData.email });

            // 2. Recupera gli avvisi dell'azienda dell'utente
            const alertsResponse = await fetch("/api/alerts/getAllAlerts", { next: { revalidate: 5 } });
            if (!alertsResponse.ok) {
                const errorData = await alertsResponse.json();
                throw new Error(errorData.message || "Failed to fetch alerts.");
            }
            const data: AlertData[] = await alertsResponse.json();
            setAlerts(data);
        } catch (err: any) {
            console.error("Failed to fetch data:", err);
            // In un'app reale, potresti reindirizzare alla pagina di login o mostrare un messaggio di errore
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUserAndAlerts();
    }, []);

    if (isLoading) {
        return <div className={styles.loading}>Caricamento...</div>;
    }

    return (
        <div className={styles.siem_extern_div}>
            <div className={styles.siem_intern_div}>
                <h2>SIEM alerts</h2>
                <div className={styles.siem_log_extern_div}>
                    <div className={styles.siem_log_intern_div}>
                        <ListAlerts
                            alerts={alerts}
                            setCurrentAlert={setCurrentAlert}
                            currentAlertId={currentAlert?.id}
                            onActionComplete={fetchUserAndAlerts} // Passa la funzione per il re-fetch
                            userRole={userInfo?.role}
                            socId={userInfo?.socId}
                            email={userInfo?.email}
                        />
                    </div>
                    <div className={styles.siem_log_extern_right_div}>
                        <ViewAlert alert={currentAlert} />
                        {currentAlert && <ViewAlertRaw rawData={currentAlert.raw_data} />}
                    </div>
                </div>
            </div>
        </div>
    );
}
