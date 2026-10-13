"use client";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import Dashboard from "../components/dashboard/page";
import Navbar from "../components/fundamentals/navbar/page";
import UserManagementComponent from "../components/userManagement/page";

// Definiamo un'interfaccia per il tipo di dato che ci aspettiamo dalla API
interface AuthPayload {
  role: "admin" | "editor" | "user";
  companyId?: number;
  status: string;
}

export default function Home() {
  const [userRole, setUserRole] = useState<"admin" | "editor" | "user" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await fetch("/api/user/info");
        if (response.ok) {
          const { role } = await response.json() as AuthPayload;
          console.log("User Role:", role)
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

  // Renderizza il contenuto in base al ruolo dell'utente
  return (
    <div className={styles.page}>
      <Navbar selected="DASHBOARD" userRole={userRole} />
      {userRole === "admin" ? <UserManagementComponent /> : <Dashboard />}
    </div>
  );
}