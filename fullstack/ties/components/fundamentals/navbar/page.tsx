"use client";
import { useState } from "react";
import styles from "./navbar.module.css";
import Image from "next/image";
import Link from "next/link";
import Dashboard from "../../../public/dashboard/home.svg";
import SiemAlerts from "../../../public/dashboard/column-chart.svg";
import CheckUsers from "../../../public/dashboard/user-profile.svg";
import ThreatPatterns from "../../../public/dashboard/threat-patterns.svg";
import ExitIcon from "../../../public/dashboard/exit-icon.svg";
import { useRouter } from "next/navigation";

export default function Navbar({
  selected,
  userRole,
}: {
  selected: string;
  userRole: "admin" | "editor" | "user" | null;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/user/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      router.push("/");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <nav className={styles.navbar_extern_div}>
      {/* Header con titolo e hamburger */}
      <div className={styles.navbar_header}>
        <h1 className={styles.navbar_logo}>TIES</h1>
        <button
          className={styles.hamburger}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </div>

      {/* Menu (desktop sempre visibile, mobile a toggle) */}
      <div
        className={`${styles.navbar_menu_div} ${
          isOpen ? styles.showMenu : ""
        }`}
      >
        {userRole !== "admin" && (
          <>
            <Link
              href="/"
              className={`${styles.navbar_menu_button} ${
                selected === "DASHBOARD" ? styles.navbar_menu_button_selected : ""
              }`}
            >
              <Image src={Dashboard} width={23} height={23} alt="Dashboard" />
              <div className={styles.navbar_menu_text}>Dashboard</div>
            </Link>
            <Link
              href="/siem-alerts"
              className={`${styles.navbar_menu_button} ${
                selected === "SIEM-ALERTS"
                  ? styles.navbar_menu_button_selected
                  : ""
              }`}
            >
              <Image src={SiemAlerts} width={23} height={23} alt="SIEM" />
              <div className={styles.navbar_menu_text}>SIEM alerts</div>
            </Link>
            <Link
              href="/threat-patterns"
              className={`${styles.navbar_menu_button} ${
                selected === "THREAT-PATTERNS"
                  ? styles.navbar_menu_button_selected
                  : ""
              }`}
            >
              <Image
                src={ThreatPatterns}
                width={23}
                height={23}
                alt="Threat Patterns"
              />
              <div className={styles.navbar_menu_text}>Threat Patterns</div>
            </Link>
          </>
        )}

        <Link
          href="/user-managment"
          className={`${styles.navbar_menu_button} ${
            selected === "CHECK-USERS"
              ? styles.navbar_menu_button_selected
              : ""
          }`}
        >
          <Image src={CheckUsers} width={23} height={23} alt="Check Users" />
          <div className={styles.navbar_menu_text}>Check Users</div>
        </Link>

        <div
          onClick={handleLogout}
          className={`${styles.navbar_menu_button} ${styles.logout_button}`}
        >
          <Image src={ExitIcon} width={23} height={23} alt="Logout" />
          <div className={styles.navbar_menu_text}>Logout</div>
        </div>
      </div>
    </nav>
  );
}
