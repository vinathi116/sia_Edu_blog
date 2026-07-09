import { API_ORIGIN_URL } from "../services/api";

export function resolveMediaUrl(value) {
  const url = String(value || "").trim();
  if (!url) return "";
  if (/^(https?:\/\/|blob:|data:)/i.test(url)) return url;
  if (url.startsWith("/media/")) return `${API_ORIGIN_URL}${url}`;
  if (url.startsWith("media/")) return `${API_ORIGIN_URL}/${url}`;
  if (url.startsWith("/")) return url;
  return `/${url.replace(/^\/+/, "")}`;
}

export function isBackendMediaUrl(value) {
  const url = String(value || "").trim();
  return /^https?:\/\/[^/]+\/media\//i.test(url) || /^\/?media\//i.test(url);
}
