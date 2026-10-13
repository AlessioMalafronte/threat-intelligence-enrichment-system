import styles from "../siem.module.css";
import { AlertData } from "@/types/AlertData";

interface ViewAlertProps {
  alert: AlertData | null | undefined;
}

export default function ViewAlert({ alert }: ViewAlertProps) {
  if (!alert?.enrichment) return null;

  const enrichment = alert.enrichment;

  const readableLabels: Record<keyof typeof enrichment, string> = {
    ip: "Source IP",
    port: "Port",
    user: "User",
    hostname: "Hostname",
    email: "Email",
    domain: "Domain",
    useragent: "User Agent",
    hash: "Hash",
    urlscan: "URLScan",
    process: "Process",
  };

  return (
    <div className={styles.view_alert_extern_div}>
      {Object.entries(enrichment).map(([key, value]) => {
        if (
          value === null ||
          value === "" ||
          (key === "port" && value === 0)
        ) {
          return null;
        }

        let displayedValue = value;

        // Se la chiave è 'ip' o 'url' e il valore è un oggetto,
        // mostra solo la proprietà 'value'
        if ((key === "ip" || key === "url") && typeof value === "object" && value !== null) {
          displayedValue = value.value;
        }

        const isObject = typeof displayedValue === "object" && displayedValue !== null;

        return (
          <div key={key} className={styles.view_alert_value_div}>
            <h4>{readableLabels[key as keyof typeof enrichment] || key}:</h4>
            <span>
              {isObject ? JSON.stringify(displayedValue, null, 2) : displayedValue}
            </span>
          </div>
        );
      })}
    </div>
  );
}