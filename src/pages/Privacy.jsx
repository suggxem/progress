import { useApp } from "../context/AppContext"
import useScrollReveal from "../hooks/useScrollReveal"

function RevealSection({ children, className = "" }) {
    const [ref, isVisible] = useScrollReveal({ threshold: 0.1 })
    const cls = `reveal ${isVisible ? "visible" : ""} ${className}`
    return <div ref={ref} className={cls}>{children}</div>
}

export default function Privacy() {
    const { copy, locale } = useApp()
    const c = copy.privacy

    return (
        <main id="main-content">
            <section className="section">
                <RevealSection className="section-heading">
                    <p className="section-kicker">{c.kicker}</p>
                    <h2>{c.title}</h2>
                    <p>{c.updated}</p>
                </RevealSection>

                <div style={{ display: "grid", gap: "clamp(14px,2vw,20px)", marginTop: "clamp(14px,2vw,20px)" }}>
                    {c.sections.map((section, i) => (
                        <RevealSection key={i} className="contact-note">
                            <h3>{section.heading}</h3>
                            <p>{section.text}</p>
                        </RevealSection>
                    ))}
                </div>
            </section>
        </main>
    )
}
