import styles from "./dashboard.module.css";
import Link from "next/link";

export default function Dashboard() {
  return (
    <div className={styles.dashboard_extern_div}>
      <div className={styles.dashboard_header_div}>
        <div className={`${styles.dashboard_alert_div} ${styles.dashboard_header_children}`}>
          <div>Alerts</div>
          <div className={styles.dashboard_alert_number}>{40}</div>
        </div>
        <div className={`${styles.dashboard_threat_actors_div} ${styles.dashboard_header_children}`}>
          <div>
            <div>Threat Actors</div>
            <div className={styles.dashboard_alert_number}>{40}</div>
          </div>
          <div>
            
          </div>
          <div className={styles.dashboard_alert_navigation_icon}>
            {`>`}
          </div>
        </div>
      </div>
      <div className={styles.dashboard_siem_log_div}>
        <div className={styles.dashboard_siem_log_header}>
          <div>
            Recent SIEM alerts
          </div>
          <Link href="/siem-alerts" className={styles.dashboard_siem_log_button}>
            view all
          </Link>
        </div>
        <div>
          
        </div>
      </div>
    </div>
  );
}
