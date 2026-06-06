import { useState, useEffect } from "react"

export default function ReadingProgress() {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY
            const docHeight = document.documentElement.scrollHeight - window.innerHeight
            if (docHeight > 0) {
                setProgress(Math.min((scrollTop / docHeight) * 100, 100))
            }
        }

        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <div className="reading-progress" aria-hidden="true">
            <div className="reading-progress-bar" style={{ width: `${progress}%` }} />
        </div>
    )
}