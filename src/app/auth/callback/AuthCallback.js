"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://sharx-backend.onrender.com";

export default function AuthCallback() {
  const router = useRouter();
  const { login } = useAuth();

  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;

    startedRef.current = true;

    const exchangeCode = async () => {
      try {
        const params = new URLSearchParams(
          window.location.search
        );

        const code = params.get("code");

        if (!code) {
          router.replace("/home");
          return;
        }

        const response = await fetch(
          `${API_BASE}/auth/exchange`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              code,
            }),
          }
        );

        const data = await response
          .json()
          .catch(() => ({}));

        if (!response.ok || !data?.token) {
          throw new Error(
            data?.error ||
              data?.message ||
              "Authentication exchange failed"
          );
        }

        // IMPORTANT:
        // Update AuthContext + localStorage.
        login(data.token);

        if (data.user) {
          localStorage.setItem(
            "user",
            JSON.stringify(data.user)
          );
        }

        // Remove the one-time OAuth code
        // from the browser URL.
        window.history.replaceState(
          {},
          document.title,
          "/auth/callback"
        );

        // Return to the same place where login
        // is actually used.
        router.replace("/home");
      } catch (error) {
        console.error(
          "OAuth callback error:",
          error
        );

        router.replace("/home");
      }
    };

    exchangeCode();
  }, [router, login]);

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fff",
        color: "#1B2A41",
        fontFamily: "Comfortaa, sans-serif",
        fontSize: "16px",
        fontWeight: 700,
      }}
    >
      Signing you in...
    </div>
  );
}