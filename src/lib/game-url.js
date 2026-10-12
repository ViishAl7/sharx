const BLOCKED_HOSTS = new Set([
  "localhost",
  "www.localhost",
  "127.0.0.1",
  "www.127.0.0.1",
  "0.0.0.0",
  "::1",
  "sharx.in",
  "www.sharx.in",
]);

function isPrivateIpv4(hostname) {
  const parts = hostname.split(".").map(Number);

  if (
    parts.length !== 4 ||
    parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)
  ) {
    return false;
  }

  const [a, b] = parts;

  return (
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  );
}

export function getSafeGameUrl(value) {
  if (typeof value !== "string") return "";

  const raw = value.trim();

  if (!raw || raw.length > 2048) return "";

  try {
    const url = new URL(raw);

    if (url.protocol !== "https:") return "";
    if (url.username || url.password) return "";

    const hostname = url.hostname.toLowerCase();

    if (BLOCKED_HOSTS.has(hostname)) return "";
    if (isPrivateIpv4(hostname)) return "";

    return url.toString();
  } catch {
    return "";
  }
}
