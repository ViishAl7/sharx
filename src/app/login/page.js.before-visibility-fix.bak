"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { rememberReturnTo } from "../../lib/auth-session";
import SidePanel from "../../legacy/SidePanel";

export default function LoginPage() {
  const router = useRouter();

  const getLoginDestination = () => {
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next");

    if (
      next &&
      next.startsWith("/") &&
      !next.startsWith("//") &&
      !next.startsWith("/login") &&
      !next.startsWith("/auth/callback")
    ) {
      return next;
    }

    return "/home";
  };

  useEffect(() => {
    const destination = getLoginDestination();

    if (destination !== "/home") {
      rememberReturnTo(destination);
    }
  }, []);

  return (
    <main className="sharx-standalone-auth">
      <style jsx global>{`
        .sharx-standalone-auth .pv-overlay {
          display: none !important;
        }

        .sharx-standalone-auth .pv-panel {
          width: 100% !important;
          max-width: none !important;
          left: 0 !important;
          right: 0 !important;
          border-radius: 0 !important;
          animation: sharx-auth-enter 0.35s ease both !important;
          overflow-y: auto !important;
          padding: 32px 0 !important;
        }

        .sharx-standalone-auth .pv-card {
          width: min(360px, calc(100vw - 36px)) !important;
          max-width: none !important;
          margin: auto !important;
        }

        .sharx-standalone-auth .pv-close {
          position: fixed !important;
        }

        @keyframes sharx-auth-enter {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @media (max-height: 700px) {
          .sharx-standalone-auth .pv-panel {
            align-items: flex-start !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .sharx-standalone-auth .pv-panel {
            animation: none !important;
          }
        }
      `}</style>

      <SidePanel mode="login" onClose={() => router.replace(getLoginDestination())} />
    </main>
  );
}
