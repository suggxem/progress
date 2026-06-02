import { useEffect, useRef, useState } from "react"

export default function CursorGlow() {
    const [pos, setPos] = useState({ x: -100, y: -100 })
    const visibleRef = useRef(false)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0
        if (isTouch) return

        const handleMove = (e) => {
            setPos({ x: e.clientX, y: e.clientY })
            if (!visibleRef.current) {
                visibleRef.current = true
                setVisible(true)
            }
        }
        const handleLeave = () => {
            visibleRef.current = false
            setVisible(false)
        }
        const handleEnter = () => {
            visibleRef.current = true
            setVisible(true)
        }

        document.addEventListener("mousemove", handleMove)
        document.addEventListener("mouseleave", handleLeave)
        document.addEventListener("mouseenter", handleEnter)
        return () => {
            document.removeEventListener("mousemove", handleMove)
            document.removeEventListener("mouseleave", handleLeave)
            document.removeEventListener("mouseenter", handleEnter)
        }
    }, [])

    return (
        <div
            className="cursor-glow"
            style={{
                transform: `translate(${pos.x}px, ${pos.y}px)`,
                opacity: visible ? 1 : 0,
            }}
            aria-hidden="true"
        />
    )
}
