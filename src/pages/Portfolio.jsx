import { useState } from "react"
import { useApp } from "../context/AppContext"
import useScrollReveal from "../hooks/useScrollReveal"
import useTilt from "../hooks/useTilt"
import { assetUrl } from "../lib/api"

function RevealSection({ children, className = "", type = "", index = 0 }) {
    const [ref, isVisible] = useScrollReveal({ threshold: 0.1 })
    const cls = `reveal${type ? `-${type}` : ""} ${isVisible ? "visible" : ""} ${className}`
    return <div ref={ref} className={cls} style={{ "--stagger": index }}>{children}</div>
}

function TiltCard({ children, className = "", deg = 8 }) {
    const ref = useTilt(deg)
    return <div ref={ref} className={`tilt-card ${className}`}>{children}</div>
}

const portfolioItems = [
    { titleAr: "موقع شركة تكافل", titleEn: "Takafol Company Site", cat: "websites", image: "/images/erp-system.jpg" },
    { titleAr: "منصة إدارة الموارد", titleEn: "Resource Management Platform", cat: "platforms", image: "/images/integration-software.png" },
    { titleAr: "متجر إلكتروني", titleEn: "E-commerce Store", cat: "ecommerce", image: "/images/ecommerce.webp" },
    { titleAr: "برنامج محاسبي", titleEn: "Accounting Software", cat: "platforms", image: "/images/own-software.jpg" },
    { titleAr: "موقع شخصي احترافي", titleEn: "Professional Portfolio", cat: "websites", image: "/images/erp-system.jpg" },
    { titleAr: "نظام حجوزات", titleEn: "Booking System", cat: "platforms", image: "/images/integration-software.png" },
]

const categories = ["all", "websites", "platforms", "ecommerce"]

export default function Portfolio() {
    const { copy, locale } = useApp()
    const [filter, setFilter] = useState("all")

    const filtered = filter === "all" ? portfolioItems : portfolioItems.filter((item) => item.cat === filter)
    const catLabels = {
        all: locale === "ar" ? "الكل" : "All",
        websites: locale === "ar" ? "مواقع" : "Websites",
        platforms: locale === "ar" ? "منصات" : "Platforms",
        ecommerce: locale === "ar" ? "متاجر" : "E-commerce",
    }

    return (
        <main id="main-content">
            <section className="section">
                <RevealSection className="section-heading">
                    <p className="section-kicker">{copy.portfolio.kicker}</p>
                    <h2>{copy.portfolio.title}</h2>
                    <p>{copy.portfolio.text}</p>
                </RevealSection>

                <div className="portfolio-filters">
                    {categories.map((cat) => (
                        <button key={cat} type="button"
                            className={`button ${filter === cat ? "button-dark" : "button-outline"}`}
                            onClick={() => setFilter(cat)}>
                            {catLabels[cat]}
                        </button>
                    ))}
                </div>

                <div className="showcase-grid" style={{ marginTop: "clamp(14px,2vw,20px)" }}>
                    {filtered.map((item, i) => (
                        <RevealSection key={item.titleEn} className="showcase-card" type="scale" index={i}>
                            <TiltCard deg={6}>
                                <div className="showcase-image-wrap">
                                    <img className="showcase-image" src={assetUrl(item.image)}
                                        alt={locale === "ar" ? item.titleAr : item.titleEn} loading="lazy" />
                                    <div className="showcase-image-overlay" aria-hidden="true" />
                                </div>
                                <h3>{locale === "ar" ? item.titleAr : item.titleEn}</h3>
                            </TiltCard>
                        </RevealSection>
                    ))}
                </div>
            </section>
        </main>
    )
}
