import { useEffect, useRef } from "react"

export default function useMagnetic(radius = 14) {
    const ref = useRef(null)
    const cleanupRef = useRef(null)

    useEffect(() => {
        const el = ref.current
        if (!el) return

        const onMove = (e) => {
            const rect = el.getBoundingClientRect()
            const dx = (e.clientX - rect.left - rect.width / 2) * 0.3
            const dy = (e.clientY - rect.top - rect.height / 2) * 0.3
            const dist = Math.min(Math.sqrt(dx * dx + dy * dy), radius)
            const angle = Math.atan2(dy, dx)
            el.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px)`
        }

        const onLeave = () => {
            el.style.transform = "translate(0, 0)"
            el.style.transition = "transform 0.4s cubic-bezier(0.22,1,0.36,1)"
            cleanupRef.current = setTimeout(() => {
                el.style.transition = ""
                el.style.transform = ""
            }, 400)
        }

        el.addEventListener("mousemove", onMove)
        el.addEventListener("mouseleave", onLeave)

        return () => {
            el.removeEventListener("mousemove", onMove)
            el.removeEventListener("mouseleave", onLeave)
            clearTimeout(cleanupRef.current)
        }
    }, [radius])

    return ref
}
