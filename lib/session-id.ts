"use client";

const SESSION_KEY = "equipcheck_session_id";
const UTM_KEY = "equipcheck_utm";

export interface UtmParams {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
}

export function getSessionId(): string {
  if (typeof window === "undefined") return "";

  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
    // Capture UTM on first session creation
    captureUtm();
  }
  return id;
}

function captureUtm() {
  const params = new URLSearchParams(window.location.search);
  const utm: UtmParams = {
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
  };
  if (utm.utm_source || utm.utm_medium || utm.utm_campaign) {
    sessionStorage.setItem(UTM_KEY, JSON.stringify(utm));
  }
}

export function getUtmParams(): UtmParams {
  if (typeof window === "undefined") {
    return { utm_source: null, utm_medium: null, utm_campaign: null };
  }

  // Check URL first (in case user arrived with new UTM after session started)
  const params = new URLSearchParams(window.location.search);
  const fromUrl: UtmParams = {
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
  };
  if (fromUrl.utm_source || fromUrl.utm_medium || fromUrl.utm_campaign) {
    sessionStorage.setItem(UTM_KEY, JSON.stringify(fromUrl));
    return fromUrl;
  }

  // Fall back to stored values
  const stored = sessionStorage.getItem(UTM_KEY);
  if (stored) {
    return JSON.parse(stored) as UtmParams;
  }

  return { utm_source: null, utm_medium: null, utm_campaign: null };
}
