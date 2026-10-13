"use client";
import { AlertData } from "@/types/AlertData";
import { useState } from "react";
import styles from "../../siem.module.css";

interface AlertActionsProps {
    alert: AlertData;
    onActionComplete: () => void;
    userRole: string | null | undefined;
    socId: number | null | undefined;
}

const AlertActions: React.FC<AlertActionsProps> = ({ alert, onActionComplete, userRole, socId }) => {
    const [isResolving, setIsResolving] = useState(false);
    const [reportText, setReportText] = useState("");
    const [showReportModal, setShowReportModal] = useState(false);

    const handleTakeCharge = async () => {
        try {
            const response = await fetch("/api/alerts/takeCharge", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ alertId: alert.id }),
            });
            if (response.ok) {
                onActionComplete();
            } else {
                const data = await response.json();
            }
        } catch (error) {
        }
    };

    const handleResolve = async () => {
        if (!reportText.trim()) {
            return;
        }

        setIsResolving(true);
        try {
            const response = await fetch("/api/alerts/markResolved", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ alertId: alert.id, report: { text: reportText } }),
            });

            if (response.ok) {
                onActionComplete();
                setShowReportModal(false);
                setReportText("");
            } else {
                const data = await response.json();
            }
        } catch (error) {
        } finally {
            setIsResolving(false);
        }
    };

    const canTakeCharge = alert.status === 0 && userRole === "editor";
    const canResolve = alert.status === 1 && userRole === "editor" && alert.soc_id === socId;

    return (
        <div className={styles.alert_actions_container}>
            {canTakeCharge && (
                <button
                    onClick={handleTakeCharge}
                    className={`${styles.action_button} ${styles.take_charge_button}`}
                    disabled={alert.isTakingCharge}
                >
                    Prendi in Carico
                </button>
            )}
            {canResolve && (
                <button
                    onClick={() => setShowReportModal(true)}
                    className={`${styles.action_button} ${styles.resolve_button}`}
                    disabled={isResolving}
                >
                    {isResolving ? "Risoluzione..." : "Risolto"}
                </button>
            )}

            {showReportModal && (
                <div className={styles.report_modal_backdrop}>
                    <div className={styles.report_modal}>
                        <h3>Report di risoluzione</h3>
                        <textarea
                            value={reportText}
                            onChange={(e) => setReportText(e.target.value)}
                            rows={5}
                            placeholder="Descrivi come hai risolto l'avviso..."
                        />
                        <div className={styles.modal_buttons}>
                            <button onClick={handleResolve} disabled={isResolving}>
                                Invia
                            </button>
                            <button onClick={() => setShowReportModal(false)}>
                                Annulla
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AlertActions;
