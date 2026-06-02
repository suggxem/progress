import { useEffect, useRef, useState } from "react"

export default function useTextReveal(stagger = 40) {
    const ref = useRef(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const el = ref.current
        if (!el) return

        const text = el.textContent
        const words = text.split(" ")
        el.innerHTML = words
            .map((w, i) => `<span class="word-reveal" style="--word-index: ${i}">${w}</span>`)
            .join(" ")

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    el.classList.add("words-visible")
                    observer.unobserve(el)
                }
            },
            { threshold: 0.2 }
        )

        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    return [ref, isVisible]
}
