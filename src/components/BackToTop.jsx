import { useState, useEffect } from "react"

export default function BackToTop({ locale }) {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setVisible(window.scrollY > 400)
        }
        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    return (
        <button
            type="button"
            className={`back-to-top ${visible ? "visible" : ""}`}
            onClick={scrollToTop}
            aria-label={locale.backToTop}
            title={locale.backToTop}
        >
            ↑
        </button>
    )
}