"use client";
import { useEffect, useState } from "react";
import styles from "../page.module.css";
import Navbar from "../../components/fundamentals/navbar/page";
import UserManagementComponent from "../../components/userManagement/page";

interface AuthPayload {
  role: "admin" | "editor" | "user";
  companyId?: number;
  status: string;
}

export default function UserManagement() {
  const [userRole, setUserRole] = useState<"admin" | "editor" | "user" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await fetch("/api/user/info");
        if (response.ok) {
          const { role } = await response.json() as AuthPayload;
          setUserRole(role);
        } else {
          setUserRole(null);
        }
      } catch (err) {
        console.error("Errore durante il recupero del ruolo utente:", err);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUserRole();
  }, []);

  if (loading) {
    return <div>Caricamento...</div>;
  }

  return (
    <div className={styles.page}>
      <Navbar selected="USER-MANAGEMENT" userRole={userRole} />
      <div className={styles.content}>
        <UserManagementComponent />
      </div>
    </div>
  );
}