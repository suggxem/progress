export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/$/, "")

export function assetUrl(path) {
    if (!path) return path
    if (/^https?:\/\//i.test(path)) return path
    if (path.startsWith("/uploads/")) return `${API_URL}${path}`
    return path
}

export async function apiFetch(path, options) {
    return fetch(`${API_URL}${path}`, options)
}
