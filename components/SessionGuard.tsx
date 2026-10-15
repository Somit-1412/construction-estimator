"use client";

import { useEffect } from "react";

interface SessionGuardProps {
  type: "customer" | "engineer";
}

export function SessionGuard({ type }: SessionGuardProps) {
  const loginUrl = type === "engineer" ? "/engineer-login" : "/login";
  const checkUrl =
    type === "engineer" ? "/api/auth/session" : "/api/customer-auth/session";

  useEffect(() => {
    function redirectToLogin() {
      if (typeof document !== "undefined" && document.body) {
        document.body.style.display = "none";
      }
      window.location.replace(loginUrl);
    }

    async function checkSession() {
      try {
        const res = await fetch(checkUrl, {
          method: "GET",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
          cache: "no-store",
        });

        if (!res.ok) {
          redirectToLogin();
        }
      } catch {
        // Network failure
      }
    }

    function onPageShow(event: PageTransitionEvent) {
      if (event.persisted) {
        // Page was restored from the browser's back-forward cache (bfcache).
        // Immediately conceal the sensitive page contents and reload to force server authentication.
        if (typeof document !== "undefined" && document.body) {
          document.body.style.display = "none";
        }
        window.location.reload();
      } else {
        const navEntries = window.performance?.getEntriesByType?.("navigation");
        const nav = navEntries?.[0] as PerformanceNavigationTiming | undefined;
        if (nav?.type === "back_forward") {
          checkSession();
        }
      }
    }

    const navEntries = window.performance?.getEntriesByType?.("navigation");
    const nav = navEntries?.[0] as PerformanceNavigationTiming | undefined;
    if (nav?.type === "back_forward") {
      checkSession();
    }

    window.addEventListener("pageshow", onPageShow);
    return () => {
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [checkUrl, loginUrl]);

  return null;
}
