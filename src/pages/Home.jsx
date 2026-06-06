import { useState, useEffect, useMemo, useRef } from "react"
import { useApp } from "../context/AppContext"
import useScrollReveal from "../hooks/useScrollReveal"
import useCounterOnScroll from "../hooks/useCounterOnScroll"
import useTilt from "../hooks/useTilt"
import MagneticButton from "../components/MagneticButton"
import { apiFetch, assetUrl } from "../lib/api"

const serviceIcons = { websites: "🏢", platforms: "⚙️", ecommerce: "🛒" }
const avatarColors = ["#8a7bff", "#62c5ff", "#ff7ad9"]

function getInitials(name) {
    return name.split(" ").map((w) => w[0]).join("")
}

function RevealSection({ children, className = "", type = "", index = 0 }) {
    const [ref, isVisible] = useScrollReveal({ threshold: 0.1 })
    const cls = `reveal${type ? `-${type}` : ""} ${isVisible ? "visible" : ""} ${className}`
    return <div ref={ref} className={cls} style={{ "--stagger": index }}>{children}</div>
}

function TiltCard({ children, className = "", style = {}, deg = 8 }) {
    const ref = useTilt(deg)
    return <div ref={ref} className={`tilt-card ${className}`} style={style}>{children}</div>
}

function FaqItem({ q, a, isOpen, onClick }) {
    return (
        <div className={`faq-item ${isOpen ? "open" : ""}`}>
            <button type="button" className="faq-question" onClick={onClick}>
                <span>{q}</span>
                <span className="faq-icon">+</span>
            </button>
            <div className="faq-answer"><p>{a}</p></div>
        </div>
    )
}

export default function Home() {
    const { copy, locale } = useApp()
    const [selectedServiceKey, setSelectedServiceKey] = useState("websites")
    const [formData, setFormData] = useState({ name: "", email: "", phone: "", project: "" })
    const [statusType, setStatusType] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [openFaqIndex, setOpenFaqIndex] = useState(null)
    const heroRef = useRef(null)
    const [counterRef, counterValues] = useCounterOnScroll([3000000, 100, 12], 2200)

    const selectedService = useMemo(
        () => copy.services.find((s) => s.key === selectedServiceKey) ?? copy.services[0],
        [copy, selectedServiceKey],
    )

    useEffect(() => {
        try {
            const draft = localStorage.getItem("contact-draft")
            if (draft) {
                const parsed = JSON.parse(draft)
                if (parsed.name || parsed.email || parsed.project) setFormData(parsed)
            }
        } catch { }
    }, [])

    useEffect(() => {
        try { localStorage.setItem("contact-draft", JSON.stringify(formData)) } catch { }
    }, [formData])

    useEffect(() => {
        if (window.location.hash) {
            const id = window.location.hash.replace("#", "")
            setTimeout(() => {
                document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
            }, 200)
        }
    }, [])

    const formatCounter = (value, index) => {
        if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M+`
        if (index === 1) return `${value}%`
        if (index === 2) return `${value}+`
        return value
    }

    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        setStatusType(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.name || !formData.email || !formData.project || !isValidEmail(formData.email)) {
            setStatusType("error"); return
        }
        setIsSubmitting(true)
        try {
            const res = await apiFetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })
            const data = await res.json()
            if (data.success) {
                setStatusType("success")
                setFormData({ name: "", email: "", phone: "", project: "" })
                try { localStorage.removeItem("contact-draft") } catch { }
            } else { setStatusType("error") }
        } catch { setStatusType("error") }
        finally { setIsSubmitting(false) }
    }

    const toggleFaq = (index) => setOpenFaqIndex((prev) => (prev === index ? null : index))

    const renderStars = (rating) => Array.from({ length: 5 }, (_, i) => (
        <span key={i}>{i < rating ? "★" : "☆"}</span>
    ))

    return (
        <>
            <section className="hero" ref={heroRef}>
                <RevealSection className="hero-copy">
                    <div className="hero-badge">{copy.hero.badge}</div>
                    <h1>{copy.hero.title}</h1>
                    <p className="hero-text">{copy.hero.text}</p>
                    <div className="hero-actions">
                        <a className="button button-light" href="#services">{copy.hero.primary}</a>
                        <MagneticButton className="button button-outline" onClick={() => document.getElementById("showcase")?.scrollIntoView({ behavior: "smooth" })}>
                            {copy.hero.secondary}
                        </MagneticButton>
                    </div>
                    <div className="hero-stats" ref={counterRef}>
                        {copy.hero.stats.map((stat, i) => (
                            <article key={stat.label} className="hero-stat">
                                <strong>{formatCounter(counterValues[i], i)}</strong>
                                <span>{stat.label}</span>
                            </article>
                        ))}
                    </div>
                    <div className="hero-chips" aria-label="Highlights">
                        {copy.hero.chips.map((chip) => <span key={chip}>{chip}</span>)}
                    </div>
                </RevealSection>

                <RevealSection type="right" className="hero-panel">
                    <div className="hero-panel-main">
                        <p className="panel-kicker">{copy.hero.spotlightTitle}</p>
                        <h2>{selectedService.title}</h2>
                        <p>{copy.hero.spotlightText}</p>
                        <div className="panel-chip-row">
                            <span>{selectedService.accent}</span>
                            <span>{copy.brand}</span>
                        </div>
                    </div>
                    <div className="hero-card-grid">
                        {copy.services.map((s) => (
                            <button key={s.key} type="button"
                                className={`service-card ${selectedServiceKey === s.key ? "active" : ""}`}
                                onClick={() => setSelectedServiceKey(s.key)}>
                                <span className="service-icon">{serviceIcons[s.key]}</span>
                                <span className="service-title">{s.title}</span>
                                <span className="service-description">{s.description}</span>
                                <span className="service-chip">{s.accent}</span>
                            </button>
                        ))}
                    </div>
                </RevealSection>
            </section>

            <section className="trust-row" aria-label="Trusted by">
                <p>{copy.trustTitle}</p>
                <div className="trust-marquee">
                    <div className="trust-marquee-inner">
                        {[...copy.trustItems, ...copy.trustItems].map((item, i) => (
                            <span key={i} className="button button-outline" style={{ minHeight: "auto", padding: "6px 14px", cursor: "default" }}>{item}</span>
                        ))}
                    </div>
                </div>
            </section>

            <main id="main-content">
                <section id="services" className="section section-dark">
                    <div className="mesh-bg" aria-hidden="true">
                        <div className="mesh-bg-blob" />
                        <div className="mesh-bg-blob" />
                        <div className="mesh-bg-blob" />
                    </div>
                    <RevealSection className="section-heading">
                        <p className="section-kicker">{copy.servicesSection.kicker}</p>
                        <h2 className="text-reveal">{copy.servicesSection.title}</h2>
                        <p>{copy.servicesSection.text}</p>
                    </RevealSection>
                    <div className="service-grid-bento">
                        {copy.services.map((service) => (
                            <TiltCard key={service.key} className="service-card service-card-large" deg={8}>
                                <button type="button"
                                    className={selectedServiceKey === service.key ? "active" : ""}
                                    onClick={() => setSelectedServiceKey(service.key)}
                                    style={{ all: "unset", cursor: "pointer", display: "grid", gap: "inherit", width: "100%", textAlign: "left" }}>
                                    <span className="service-icon">{serviceIcons[service.key]}</span>
                                    <span className="service-title">{service.title}</span>
                                    <span className="service-description">{service.description}</span>
                                    <span className="service-chip">{service.accent}</span>
                                    <span className="service-link">
                                        {selectedServiceKey === service.key
                                            ? (locale === "ar" ? "الخدمة المختارة" : "Selected")
                                            : (locale === "ar" ? "اختيار الخدمة" : "Select service")}
                                    </span>
                                </button>
                            </TiltCard>
                        ))}
                    </div>
                </section>

                <div className="wave-divider" aria-hidden="true">
                    <svg viewBox="0 0 1440 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0,30 C80,10 160,40 240,20 C320,0 400,30 480,15 C560,0 640,25 720,10 C800,-5 880,20 960,5 C1040,-10 1120,15 1200,0 C1280,-15 1360,10 1440,-5 L1440,60 L0,60 Z" />
                        <path d="M0,20 C80,40 160,10 240,30 C320,15 400,0 480,25 C560,10 640,35 720,20 C800,5 880,30 960,15 C1040,0 1120,25 1200,10 C1280,-5 1360,20 1440,5 L1440,60 L0,60 Z" />
                    </svg>
                </div>

                <section id="showcase" className="section">
                    <RevealSection className="section-heading">
                        <p className="section-kicker">{copy.showcaseSection.kicker}</p>
                        <h2 className="text-reveal">{copy.showcaseSection.title}</h2>
                        <p>{copy.showcaseSection.text}</p>
                    </RevealSection>
                    <div className="showcase-grid">
                        {copy.showcaseCards.map((card, i) => (
                            <RevealSection key={card.title} className="showcase-card" type="scale" index={i}>
                                <TiltCard deg={6}>
                                    <h3>{card.title}</h3>
                                    <p>{card.text}</p>
                                    <div className="showcase-image-wrap">
                                        <img className="showcase-image" src={assetUrl(card.image)} alt={card.title} loading="lazy" />
                                        <div className="showcase-image-overlay" aria-hidden="true" />
                                    </div>
                                </TiltCard>
                            </RevealSection>
                        ))}
                    </div>
                </section>

                <section id="process" className="section">
                    <RevealSection className="section-heading">
                        <p className="section-kicker">{copy.processSection.kicker}</p>
                        <h2>{copy.processSection.title}</h2>
                        <p>{copy.processSection.text}</p>
                    </RevealSection>
                    <div className="process-grid">
                        {copy.processCards.map((card, i) => (
                            <RevealSection key={card.title} className="process-card" type="scale" index={i}>
                                <TiltCard deg={6}>
                                    <span className="step-number">{String(i + 1).padStart(2, "0")}</span>
                                    <h3>{card.title}</h3>
                                    <p>{card.text}</p>
                                </TiltCard>
                            </RevealSection>
                        ))}
                    </div>
                </section>

                <div className="wave-divider" aria-hidden="true">
                    <svg viewBox="0 0 1440 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0,30 C80,10 160,40 240,20 C320,0 400,30 480,15 C560,0 640,25 720,10 C800,-5 880,20 960,5 C1040,-10 1120,15 1200,0 C1280,-15 1360,10 1440,-5 L1440,60 L0,60 Z" />
                        <path d="M0,20 C80,40 160,10 240,30 C320,15 400,0 480,25 C560,10 640,35 720,20 C800,5 880,30 960,15 C1040,0 1120,25 1200,10 C1280,-5 1360,20 1440,5 L1440,60 L0,60 Z" />
                    </svg>
                </div>

                <section className="section section-dark">
                    <div className="mesh-bg" aria-hidden="true">
                        <div className="mesh-bg-blob" />
                        <div className="mesh-bg-blob" />
                        <div className="mesh-bg-blob" />
                    </div>
                    <RevealSection className="section-heading">
                        <p className="section-kicker">{copy.testimonials.kicker}</p>
                        <h2 className="text-reveal">{copy.testimonials.title}</h2>
                        <p>{copy.testimonials.text}</p>
                    </RevealSection>
                    <div className="testimonial-grid">
                        {copy.testimonials.items.map((item, i) => (
                            <RevealSection key={item.name} className="testimonial-card" type="scale" index={i}>
                                <div className="testimonial-quote-mark" aria-hidden="true">"</div>
                                <div className="testimonial-stars">{renderStars(item.rating)}</div>
                                <p className="testimonial-text">"{item.text}"</p>
                                <div className="testimonial-author">
                                    <div className="testimonial-avatar" style={{ background: avatarColors[i % avatarColors.length] }}>
                                        {getInitials(item.name)}
                                    </div>
                                    <div>
                                        <span className="testimonial-name">{item.name}</span>
                                        <span className="testimonial-role">{item.role}</span>
                                    </div>
                                </div>
                            </RevealSection>
                        ))}
                    </div>
                </section>

                <section className="section">
                    <RevealSection className="section-heading">
                        <p className="section-kicker">{copy.faq.kicker}</p>
                        <h2>{copy.faq.title}</h2>
                    </RevealSection>
                    <div className="faq-list">
                        {copy.faq.items.map((item, index) => (
                            <RevealSection key={index} className="faq-item-wrapper">
                                <FaqItem q={item.q} a={item.a} isOpen={openFaqIndex === index} onClick={() => toggleFaq(index)} />
                            </RevealSection>
                        ))}
                    </div>
                </section>

                <section id="contact" className="section contact-section">
                    <RevealSection className="section-heading">
                        <p className="section-kicker">{copy.contactSection.kicker}</p>
                        <h2>{copy.contactSection.title}</h2>
                        <p>{copy.contactSection.text}</p>
                    </RevealSection>
                    <div className="contact-layout">
                        <RevealSection type="left" className="contact-copy">
                            <div className="contact-note">
                                <h3>{copy.contactSection.bestForTitle}</h3>
                                <p>{copy.contactSection.bestForText}</p>
                            </div>
                            <div className="contact-note">
                                <h3>{copy.contactSection.includedTitle}</h3>
                                <p>{copy.contactSection.includedText}</p>
                            </div>
                        </RevealSection>
                        <RevealSection type="right" className="contact-form">
                            <form onSubmit={handleSubmit}>
                                <label className="float-label">
                                    <span>{copy.contactSection.form.name}</span>
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange}
                                        placeholder={copy.contactSection.form.namePlaceholder} />
                                </label>
                                <label className="float-label">
                                    <span>{copy.contactSection.form.email}</span>
                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange}
                                        placeholder={copy.contactSection.form.emailPlaceholder} />
                                </label>
                                <label className="float-label">
                                    <span>{copy.contactSection.form.phone}</span>
                                    <input type="tel" inputMode="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                                        placeholder={copy.contactSection.form.phonePlaceholder} />
                                </label>
                                <label className="float-label">
                                    <span>{copy.contactSection.form.project}</span>
                                    <textarea name="project" value={formData.project} onChange={handleInputChange}
                                        placeholder={copy.contactSection.form.projectPlaceholder} rows="5" />
                                </label>
                                {statusType && <div className={`status ${statusType}`}>{copy.contactSection.status[statusType]}</div>}
                                <MagneticButton type="submit" className="button button-dark button-full" disabled={isSubmitting}>
                                    {isSubmitting ? (locale === "ar" ? "جاري الإرسال..." : "Sending...") : copy.contactSection.form.submit}
                                </MagneticButton>
                            </form>
                        </RevealSection>
                    </div>
                </section>
            </main>
        </>
    )
}
