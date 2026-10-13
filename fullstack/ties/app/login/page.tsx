"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        // Reindirizza l'utente in caso di successo
        router.push("/");
      } else {
        const data = await response.json();
        setError(data.message || "Failed to log in.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
    }
  };

  const handleOAuthLogin = () => {
    // Reindirizza l'utente alla route OAuth di Google
    const redirectUri = `${window.location.origin}/api/auth/google`;
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=profile email`;
    window.location.href = googleAuthUrl;
  };

  return (
    <div className={styles.page}>
      <div className={styles.login_extern_div}>
        <h1 className={styles.title}>Welcome back!</h1>
        <form onSubmit={handleLogin}>
          <div className={styles.form_group}>
            <input
              type="email"
              className={styles.input}
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles.form_group}>
            <input
              type="password"
              className={styles.input}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className={styles.error_message}>{error}</p>}
          <button type="submit" className={`${styles.button} ${styles.primary_button}`}>
            Login
          </button>
        </form>

        <div className={styles.divider}>or</div>

        <button onClick={handleOAuthLogin} className={`${styles.button} ${styles.oauth_button}`}>
          <img src="/login/google.webp" alt="Google Icon" style={{ width: '20px', height: '20px' }} />
          <span>Login with Google</span>
        </button>
      </div>
    </div>
  );
}