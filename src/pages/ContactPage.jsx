import { useState, useEffect } from "react"
import { useApp } from "../context/AppContext"
import useScrollReveal from "../hooks/useScrollReveal"
import { apiFetch } from "../lib/api"

function RevealSection({ children, className = "", type = "" }) {
    const [ref, isVisible] = useScrollReveal({ threshold: 0.1 })
    const cls = `reveal${type ? `-${type}` : ""} ${isVisible ? "visible" : ""} ${className}`
    return <div ref={ref} className={cls}>{children}</div>
}

export default function ContactPage() {
    const { copy, locale } = useApp()
    const [formData, setFormData] = useState({ name: "", email: "", phone: "", company: "", message: "" })
    const [statusType, setStatusType] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        try {
            const draft = localStorage.getItem("contact-page-draft")
            if (draft) {
                const parsed = JSON.parse(draft)
                if (parsed.name || parsed.email) setFormData(parsed)
            }
        } catch { }
    }, [])

    useEffect(() => {
        try { localStorage.setItem("contact-page-draft", JSON.stringify(formData)) } catch { }
    }, [formData])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        setStatusType(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.name || !formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setStatusType("error"); return
        }
        setIsSubmitting(true)
        try {
            const res = await apiFetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: formData.name, email: formData.email, phone: formData.phone, project: formData.message }),
            })
            const data = await res.json()
            if (data.success) {
                setStatusType("success")
                setFormData({ name: "", email: "", phone: "", company: "", message: "" })
                try { localStorage.removeItem("contact-page-draft") } catch { }
            } else { setStatusType("error") }
        } catch { setStatusType("error") }
        finally { setIsSubmitting(false) }
    }

    const c = copy.contactPage

    return (
        <main id="main-content">
            <section className="section">
                <RevealSection className="section-heading">
                    <p className="section-kicker">{c.kicker}</p>
                    <h2>{c.title}</h2>
                    <p>{c.text}</p>
                </RevealSection>

                <div className="contact-layout">
                    <RevealSection type="left" className="contact-copy">
                        <div className="contact-note">
                            <h3>{c.infoTitle}</h3>
                            <p><strong>{locale === "ar" ? "البريد:" : "Email:"}</strong> contact@techforgestudio.com</p>
                            <p><strong>{locale === "ar" ? "الهاتف:" : "Phone:"}</strong> +966 50 123 4567</p>
                            <p><strong>{locale === "ar" ? "المقر:" : "Office:"}</strong> {locale === "ar" ? "الرياض، المملكة العربية السعودية" : "Riyadh, Saudi Arabia"}</p>
                        </div>
                        <div className="contact-note">
                            <h3>{c.socialTitle}</h3>
                            <p>{c.socialText}</p>
                        </div>
                    </RevealSection>

                    <RevealSection type="right" className="contact-form">
                        <form onSubmit={handleSubmit}>
                            <label className="float-label">
                                <span>{c.form.name}</span>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder={c.form.namePlaceholder} />
                            </label>
                            <label className="float-label">
                                <span>{c.form.email}</span>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder={c.form.emailPlaceholder} />
                            </label>
                            <label className="float-label">
                                <span>{c.form.phone}</span>
                                <input type="tel" inputMode="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder={c.form.phonePlaceholder} />
                            </label>
                            <label className="float-label">
                                <span>{c.form.company}</span>
                                <input type="text" name="company" value={formData.company} onChange={handleChange} placeholder={c.form.companyPlaceholder} />
                            </label>
                            <label className="float-label">
                                <span>{c.form.message}</span>
                                <textarea name="message" value={formData.message} onChange={handleChange} placeholder={c.form.messagePlaceholder} rows="5" />
                            </label>
                            {statusType && (
                                <div className={`status ${statusType}`}>
                                    {statusType === "success" ? c.success : c.error}
                                </div>
                            )}
                            <button type="submit" className="button button-dark button-full" disabled={isSubmitting}>
                                {isSubmitting ? (locale === "ar" ? "جاري الإرسال..." : "Sending...") : c.submit}
                            </button>
                        </form>
                    </RevealSection>
                </div>
            </section>
        </main>
    )
}
