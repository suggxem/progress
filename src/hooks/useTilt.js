import { useEffect, useRef } from "react"

export default function useTilt(maxDeg = 8) {
    const ref = useRef(null)
    const cleanupRef = useRef(null)

    useEffect(() => {
        const el = ref.current
        if (!el) return

        const onMove = (e) => {
            const rect = el.getBoundingClientRect()
            const x = (e.clientX - rect.left) / rect.width - 0.5
            const y = (e.clientY - rect.top) / rect.height - 0.5
            el.style.transform = `perspective(800px) rotateX(${-y * maxDeg}deg) rotateY(${x * maxDeg}deg) scale3d(1.01,1.01,1.01)`
        }

        const onLeave = () => {
            el.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)"
            el.style.transition = "transform 0.5s cubic-bezier(0.22,1,0.36,1)"
            cleanupRef.current = setTimeout(() => {
                el.style.transition = ""
                el.style.transform = ""
            }, 500)
        }

        el.addEventListener("mousemove", onMove)
        el.addEventListener("mouseleave", onLeave)

        return () => {
            el.removeEventListener("mousemove", onMove)
            el.removeEventListener("mouseleave", onLeave)
            clearTimeout(cleanupRef.current)
        }
    }, [maxDeg])

    return ref
}
