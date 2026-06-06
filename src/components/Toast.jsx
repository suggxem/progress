import { useEffect, useState } from "react"

let toastIdCounter = 0

export function addToast(text, duration = 3500) {
    const id = ++toastIdCounter
    const event = new CustomEvent("show-toast", { detail: { id, text, duration } })
    window.dispatchEvent(event)
    return id
}

export default function ToastContainer() {
    const [toasts, setToasts] = useState([])

    useEffect(() => {
        const handler = (event) => {
            const { id, text, duration } = event.detail
            setToasts((prev) => [...prev, { id, text, duration, exiting: false }])

            setTimeout(() => {
                setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)))
                setTimeout(() => {
                    setToasts((prev) => prev.filter((t) => t.id !== id))
                }, 300)
            }, duration)
        }

        window.addEventListener("show-toast", handler)
        return () => window.removeEventListener("show-toast", handler)
    }, [])

    if (toasts.length === 0) return null

    return (
        <div className="toast-container" aria-live="polite">
            {toasts.map((toast) => (
                <div key={toast.id} className={`toast ${toast.exiting ? "exit" : ""}`}>
                    {toast.text}
                </div>
            ))}
        </div>
    )
}