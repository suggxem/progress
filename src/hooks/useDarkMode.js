import { useState, useEffect, useCallback } from "react"

export default function useDarkMode() {
    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("theme")
            if (stored) return stored === "dark"
            return window.matchMedia("(prefers-color-scheme: dark)").matches
        }
        return false
    })

    useEffect(() => {
        const root = document.documentElement
        if (isDark) {
            root.setAttribute("data-theme", "dark")
            localStorage.setItem("theme", "dark")
        } else {
            root.removeAttribute("data-theme")
            localStorage.setItem("theme", "light")
        }
    }, [isDark])

    const toggle = useCallback(() => setIsDark((prev) => !prev), [])

    return [isDark, toggle]
}