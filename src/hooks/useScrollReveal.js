import { useEffect, useRef, useState } from "react"

export default function useScrollReveal(options = {}) {
    const ref = useRef(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const element = ref.current
        if (!element) return

        const once = options.once !== false

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    if (once) {
                        observer.unobserve(element)
                    }
                } else if (!once) {
                    setIsVisible(false)
                }
            },
            {
                threshold: options.threshold ?? 0.15,
                rootMargin: options.rootMargin ?? "0px 0px -40px 0px",
            },
        )

        observer.observe(element)
        return () => observer.disconnect()
    }, [options.threshold, options.rootMargin, options.once])

    return [ref, isVisible]
}
