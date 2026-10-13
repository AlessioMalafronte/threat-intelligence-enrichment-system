"use client";
import styles from "../page.module.css";
import Siem from "../../components/siem/page";
import Navbar from "../../components/fundamentals/navbar/page";


export default function SiemAlerts() {


  return (
    <div className={styles.page}>
        <Navbar selected="SIEM-ALERTS"/>
        <Siem />
    </div>
  );
}
