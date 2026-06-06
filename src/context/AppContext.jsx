import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react"
import translations from "../data/translations"
import useDarkMode from "../hooks/useDarkMode"
import { apiFetch } from "../lib/api"
import { mergeContent } from "../lib/content"

const AppContext = createContext(null)

export function AppProvider({ children }) {
    const [locale, setLocale] = useState(() => {
        if (typeof window !== "undefined") return localStorage.getItem("locale") || "ar"
        return "ar"
    })
    const [isDark, toggleDark] = useDarkMode()
    const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false)
    const [isNavOpen, setIsNavOpen] = useState(false)
    const [remoteContent, setRemoteContent] = useState(null)

    const copy = useMemo(
        () => mergeContent(translations[locale], remoteContent?.[locale]),
        [locale, remoteContent],
    )

    useEffect(() => {
        let isMounted = true
        apiFetch("/api/content")
            .then((res) => res.ok ? res.json() : null)
            .then((data) => {
                if (isMounted && data?.content) setRemoteContent(data.content)
            })
            .catch(() => { })
        return () => { isMounted = false }
    }, [])

    useEffect(() => {
        document.documentElement.lang = copy.htmlLang
        document.documentElement.dir = copy.dir
        localStorage.setItem("locale", locale)
    }, [copy, locale])

    const toggleLanguage = useCallback(() => {
        setLocale((current) => (current === "ar" ? "en" : "ar"))
    }, [])

    const openProjectDialog = useCallback(() => setIsProjectDialogOpen(true), [])
    const closeProjectDialog = useCallback(() => setIsProjectDialogOpen(false), [])

    return (
        <AppContext.Provider
            value={{
                locale,
                toggleLanguage,
                isDark,
                toggleDark,
                copy,
                isProjectDialogOpen,
                openProjectDialog,
                closeProjectDialog,
                isNavOpen,
                setIsNavOpen,
            }}
        >
            {children}
        </AppContext.Provider>
    )
}

export function useApp() {
    const ctx = useContext(AppContext)
    if (!ctx) throw new Error("useApp must be used within AppProvider")
    return ctx
}
