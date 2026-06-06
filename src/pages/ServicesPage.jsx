import { useApp } from "../context/AppContext"
import useScrollReveal from "../hooks/useScrollReveal"

function RevealSection({ children, className = "", type = "", index = 0 }) {
    const [ref, isVisible] = useScrollReveal({ threshold: 0.1 })
    const cls = `reveal${type ? `-${type}` : ""} ${isVisible ? "visible" : ""} ${className}`
    return <div ref={ref} className={cls} style={{ "--stagger": index }}>{children}</div>
}

const serviceIcons = { websites: "🏢", platforms: "⚙️", ecommerce: "🛒" }

const serviceDetails = {
    websites: {
        featuresAr: ["تصميم متجاوب", "تحسين محركات البحث", "سرعة تحميل عالية", "لوحة تحكم"],
        featuresEn: ["Responsive design", "SEO optimized", "Fast loading", "Dashboard"],
        processAr: ["تحليل الاحتياجات", "تصميم الهوية", "تطوير واختبار", "إطلاق"],
        processEn: ["Needs analysis", "Identity design", "Dev & test", "Launch"],
    },
    platforms: {
        featuresAr: ["بوابات آمنة", "تقارير ذكية", "إدارة صلاحيات", "تكامل سلس"],
        featuresEn: ["Secure portals", "Smart reports", "Role management", "Seamless integration"],
        processAr: ["استشارة", "هندسة معمارية", "تطوير تدريجي", "نشر"],
        processEn: ["Consulting", "Architecture", "Iterative dev", "Deployment"],
    },
    ecommerce: {
        featuresAr: ["سلة شراء متطورة", "بوابات دفع", "إدارة مخزون", "تقارير مبيعات"],
        featuresEn: ["Advanced cart", "Payment gateways", "Inventory mgmt", "Sales reports"],
        processAr: ["دراسة السوق", "تصميم تجربة", "برمجة متجر", "اختبار وتحسين"],
        processEn: ["Market research", "UX design", "Store dev", "Testing & optimization"],
    },
}

export default function ServicesPage() {
    const { copy, locale } = useApp()

    return (
        <main id="main-content">
            {copy.services.map((service, idx) => {
                const detail = serviceDetails[service.key]
                const features = locale === "ar" ? detail.featuresAr : detail.featuresEn
                const process = locale === "ar" ? detail.processAr : detail.processEn
                return (
                    <section key={service.key} className={`section ${idx % 2 === 0 ? "section-dark" : ""}`}>
                        <RevealSection className="section-heading" index={idx}>
                            <p className="section-kicker">
                                <span className="service-icon" style={{ fontSize: "1.4rem", verticalAlign: "middle" }}>
                                    {serviceIcons[service.key]}
                                </span>{" "}
                                {service.accent}
                            </p>
                            <h2>{service.title}</h2>
                            <p>{service.description}</p>
                        </RevealSection>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(14px,2vw,20px)" }}>
                            <div className="contact-note">
                                <h3>{locale === "ar" ? "المميزات" : "Features"}</h3>
                                <ul className="feature-list">
                                    {features.map((f) => <li key={f}>{f}</li>)}
                                </ul>
                            </div>
                            <div className="contact-note">
                                <h3>{locale === "ar" ? "مراحل العمل" : "Process"}</h3>
                                <ul className="feature-list">
                                    {process.map((p) => <li key={p}>{p}</li>)}
                                </ul>
                            </div>
                        </div>
                    </section>
                )
            })}
        </main>
    )
}
