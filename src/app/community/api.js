import { API_BASE } from "../../config";
import { readToken } from "../../lib/auth-session";

export const PAGE_SIZE = 15;
export const POST_MAX = 2000;
export const COMMENT_MAX = 1000;
export const CHAT_MAX = 500;
export const DM_MAX = 1000;
export const CHAT_COOLDOWN_MS = 700; // client-side anti-spam (server enforces too)
export const REACTIONS = ["❤️", "🔥", "😂", "🎮", "👏", "😮"];

export const MEDIA_RULES = {
  "image/jpeg": 8,
  "image/png": 8,
  "image/webp": 8,
  "image/gif": 8,
  "video/mp4": 25,
  "video/webm": 25,
}; // MB

export async function readResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      data.error || data.message || `Request failed (${response.status})`
    );
  }
  return data;
}

export async function publicRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { Accept: "application/json", ...options.headers },
    cache: "no-store",
  });
  return readResponse(response);
}

/*
 * Upload with progress. Assumes the same Bearer token that the socket uses.
 * If your authFetch uses cookies instead, swap the header for `xhr.withCredentials = true`.
 */
export function uploadMedia(file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE}/community/upload`);
    const token = readToken();
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      let data = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch {}
      if (xhr.status >= 200 && xhr.status < 300) resolve(data);
      else reject(new Error(data.error || `Upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));

    const form = new FormData();
    form.append("file", file);
    xhr.send(form);
  });
}

export function getInitials(name) {
  const words = String(name || "Player").trim().split(/\s+/).filter(Boolean);
  return words.slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "P";
}

export function timeAgo(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 10) return "just now";
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function clockTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

// Only allow https URLs — blocks javascript:, data:, http: mixed content
export function safeUrl(url) {
  try {
    const u = new URL(url);
    return u.protocol === "https:" ? u.toString() : "";
  } catch {
    return "";
  }
}

export const same = (a, b) => String(a) === String(b);

// Make server posts consistent (old posts without reactions still work)
export function normalizePost(p) {
  const reactions = p.reactions && typeof p.reactions === "object" ? p.reactions : {};
  const myReaction = p.myReaction ?? (p.likedByMe ? "❤️" : null);
  return {
    ...p,
    reactions,
    myReaction,
    likeCount:
      typeof p.likeCount === "number"
        ? p.likeCount
        : Object.values(reactions).reduce((a, b) => a + b, 0),
  };
}

// Optimistic reaction change (emoji = new reaction or null to remove)
export function withReaction(post, emoji) {
  const reactions = { ...(post.reactions || {}) };
  const prev = post.myReaction;
  if (prev) {
    reactions[prev] = Math.max(0, (reactions[prev] || 1) - 1);
    if (!reactions[prev]) delete reactions[prev];
  }
  if (emoji) reactions[emoji] = (reactions[emoji] || 0) + 1;
  return {
    ...post,
    myReaction: emoji || null,
    reactions,
    likeCount: Object.values(reactions).reduce((a, b) => a + b, 0),
  };
}
