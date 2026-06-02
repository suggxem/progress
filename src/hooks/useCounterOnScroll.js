import { useEffect, useRef, useState } from "react"

export default function useCounterOnScroll(targetValues, duration = 2000) {
    const ref = useRef(null)
    const [values, setValues] = useState(targetValues.map(() => 0))
    const startedRef = useRef(false)
    const rafRef = useRef(null)
    const targetRef = useRef(targetValues)

    useEffect(() => {
        targetRef.current = targetValues
    })

    useEffect(() => {
        const el = ref.current
        if (!el) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !startedRef.current) {
                    startedRef.current = true
                    const finalTargets = targetRef.current
                    const stepTime = Math.max(16, duration / 60)
                    const steps = Math.floor(duration / stepTime)
                    let step = 0

                    const tick = () => {
                        step++
                        if (step > steps) {
                            setValues([...finalTargets])
                            return
                        }
                        const progress = step / steps
                        const eased = 1 - Math.pow(1 - progress, 3)
                        setValues(finalTargets.map((t) => Math.round(t * eased)))
                        rafRef.current = requestAnimationFrame(tick)
                    }
                    rafRef.current = requestAnimationFrame(tick)
                    observer.unobserve(el)
                }
            },
            { threshold: 0.3 }
        )

        observer.observe(el)
        return () => {
            observer.disconnect()
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current)
                rafRef.current = null
            }
        }
    }, [duration])

    return [ref, values]
}
