import { useApp } from "../context/AppContext"
import useScrollReveal from "../hooks/useScrollReveal"

function RevealSection({ children, className = "", type = "" }) {
    const [ref, isVisible] = useScrollReveal({ threshold: 0.1 })
    const cls = `reveal${type ? `-${type}` : ""} ${isVisible ? "visible" : ""} ${className}`
    return <div ref={ref} className={cls}>{children}</div>
}

const teamMembers = [
    { nameAr: "خالد الحربي", nameEn: "Khaled Al-Harbi", roleAr: "مؤسس ومطور رئيسي", roleEn: "Founder & Lead Developer", color: "#8a7bff" },
    { nameAr: "سارة المقبل", nameEn: "Sara Al-Muqbil", roleAr: "مصممة واجهات", roleEn: "UI/UX Designer", color: "#62c5ff" },
    { nameAr: "فيصل الدوسري", nameEn: "Faisal Al-Dosari", roleAr: "مطور باك إند", roleEn: "Backend Developer", color: "#ff7ad9" },
]

export default function About() {
    const { copy, locale } = useApp()
    const c = copy.about

    return (
        <main id="main-content">
            <section className="section">
                <RevealSection className="section-heading">
                    <p className="section-kicker">{c.kicker}</p>
                    <h2>{c.title}</h2>
                    <p>{c.text}</p>
                </RevealSection>

                <div style={{ display: "grid", gap: "clamp(14px,2vw,20px)", marginTop: "clamp(14px,2vw,20px)" }}>
                    <div className="contact-note">
                        <h3>{c.visionTitle}</h3>
                        <p>{c.visionText}</p>
                    </div>
                    <div className="contact-note">
                        <h3>{c.missionTitle}</h3>
                        <p>{c.missionText}</p>
                    </div>
                </div>
            </section>

            <section className="section section-dark">
                <RevealSection className="section-heading">
                    <p className="section-kicker">{c.valuesKicker}</p>
                    <h2>{c.valuesTitle}</h2>
                </RevealSection>
                <div className="process-grid">
                    {c.values.map((v, i) => (
                        <RevealSection key={v.title} className="process-card" type="scale" index={i}>
                            <span className="service-icon" style={{ fontSize: "2rem" }}>{v.icon}</span>
                            <h3>{v.title}</h3>
                            <p>{v.text}</p>
                        </RevealSection>
                    ))}
                </div>
            </section>

            <section className="section">
                <RevealSection className="section-heading">
                    <p className="section-kicker">{c.teamKicker}</p>
                    <h2>{c.teamTitle}</h2>
                    <p>{c.teamText}</p>
                </RevealSection>
                <div className="testimonial-grid">
                    {teamMembers.map((member, i) => (
                        <RevealSection key={member.nameEn} className="process-card" type="scale" index={i}
                            style={{ textAlign: "center", padding: "clamp(16px,2.5vw,24px)" }}>
                            <div className="testimonial-avatar"
                                style={{ background: member.color, width: "64px", height: "64px", fontSize: "1.2rem", margin: "0 auto 12px" }}>
                                {locale === "ar" ? member.nameAr[0] : member.nameEn[0]}
                            </div>
                            <h3 style={{ margin: "0 0 4px" }}>{locale === "ar" ? member.nameAr : member.nameEn}</h3>
                            <p style={{ color: "var(--muted)", margin: 0, fontSize: "0.9rem" }}>
                                {locale === "ar" ? member.roleAr : member.roleEn}
                            </p>
                        </RevealSection>
                    ))}
                </div>
            </section>
        </main>
    )
}
