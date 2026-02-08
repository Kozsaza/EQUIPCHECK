"use client";

import { useEffect } from "react";

const SESSION_KEY = "equipcheck_session_id";
const LINKED_KEY = "equipcheck_session_linked";

export function SessionLinker() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(LINKED_KEY)) return;

    const sessionId = sessionStorage.getItem(SESSION_KEY);
    if (!sessionId) return;

    fetch("/api/link-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId }),
    })
      .then(() => {
        sessionStorage.setItem(LINKED_KEY, "1");
      })
      .catch(() => {});
  }, []);

  return null;
}
