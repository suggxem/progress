import { useState, useEffect } from "react"

export default function CookieConsent() {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const consent = localStorage.getItem("cookie-consent")
        if (!consent) setVisible(true)
    }, [])

    const accept = () => {
        localStorage.setItem("cookie-consent", "accepted")
        setVisible(false)
    }

    if (!visible) return null

    return (
        <div className="cookie-consent" role="alert">
            <p className="cookie-consent-text">
                This site uses cookies to improve your experience.
            </p>
            <button type="button" className="button button-dark cookie-consent-btn" onClick={accept}>
                Accept
            </button>
        </div>
    )
}
