"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    console.log("Token:", token);

    if (!token) {
      router.replace("/login");
      return;
    }

    localStorage.setItem("token", token);

    // Agar user data bhi save karna ho to yahan kar sakte ho.

    router.replace("/home");
  }, [router]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100vh",
        fontSize: "18px",
        fontWeight: "600",
      }}
    >
      Signing you in...
    </div>
  );
}