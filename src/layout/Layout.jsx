import { useState, useEffect, useRef } from "react"
import { Outlet, Link, useLocation } from "react-router-dom"
import { useApp } from "../context/AppContext"
import BackToTop from "../components/BackToTop"
import ToastContainer, { addToast } from "../components/Toast"
import ReadingProgress from "../components/ReadingProgress"
import CookieConsent from "../components/CookieConsent"
import CursorGlow from "../components/CursorGlow"
import Skeleton from "../components/Skeleton"
import { apiFetch, assetUrl } from "../lib/api"

const emptyProjectBrief = {
    name: "", email: "", phone: "", projectType: "", budget: "", timeline: "", goals: "",
}

export default function Layout() {
    const {
        copy, locale, toggleLanguage, isDark, toggleDark,
        isProjectDialogOpen, openProjectDialog, closeProjectDialog,
        isNavOpen, setIsNavOpen,
    } = useApp()
    const [projectBrief, setProjectBrief] = useState(emptyProjectBrief)
    const [projectStatus, setProjectStatus] = useState(null)
    const [isProjectSubmitting, setIsProjectSubmitting] = useState(false)
    const [isPageLoading, setIsPageLoading] = useState(false)
    const [activeSection, setActiveSection] = useState("")
    const location = useLocation()
    const pageTimer = useRef(null)
    const isHome = location.pathname === "/"

    useEffect(() => {
        setIsNavOpen(false)
        setIsPageLoading(true)
        clearTimeout(pageTimer.current)
        pageTimer.current = setTimeout(() => setIsPageLoading(false), 350)
        return () => clearTimeout(pageTimer.current)
    }, [location.pathname])

    useEffect(() => {
        if (!isHome) return
        const sections = ["services", "showcase", "process", "contact"]
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id)
                    }
                }
            },
            { rootMargin: "-30% 0px -60% 0px" }
        )
        for (const id of sections) {
            const el = document.getElementById(id)
            if (el) observer.observe(el)
        }
        return () => observer.disconnect()
    }, [isHome])

    useEffect(() => {
        document.body.style.overflow = isProjectDialogOpen ? "hidden" : ""
        return () => { document.body.style.overflow = "" }
    }, [isProjectDialogOpen])

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === "Escape" && isProjectDialogOpen) closeProjectDialog()
        }
        window.addEventListener("keydown", handleKey)
        return () => window.removeEventListener("keydown", handleKey)
    }, [isProjectDialogOpen])

    const handleProjectInputChange = (event) => {
        const { name, value } = event.target
        setProjectBrief((prev) => ({ ...prev, [name]: value }))
        setProjectStatus(null)
    }

    const handleProjectSubmit = async (event) => {
        event.preventDefault()
        if (!projectBrief.name || !projectBrief.email || !projectBrief.projectType || !projectBrief.goals) {
            setProjectStatus("error"); return
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(projectBrief.email)) {
            setProjectStatus("error"); return
        }
        setIsProjectSubmitting(true)
        try {
            const res = await apiFetch("/api/project", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(projectBrief),
            })
            const data = await res.json()
            if (data.success) {
                setProjectStatus("success")
                setProjectBrief(emptyProjectBrief)
            } else {
                setProjectStatus("error")
            }
        } catch {
            setProjectStatus("error")
        } finally {
            setIsProjectSubmitting(false)
        }
    }

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href)
            addToast(copy.toasts.copied)
        } catch { }
    }

    return (
        <div className="app-shell" id="top" lang={copy.htmlLang} dir={copy.dir}>
            <ReadingProgress />
            <div className="ambient ambient-one" aria-hidden="true" />
            <div className="ambient ambient-two" aria-hidden="true" />
            <div className="ambient ambient-three" aria-hidden="true" />
            <div className="ambient ambient-four" aria-hidden="true" />
            <div className="ambient ambient-five" aria-hidden="true" />
            <div className="circuit-bg" aria-hidden="true">
                <svg viewBox="0 0 1440 900" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                    <path className="circuit-line" d="M0,100 L180,100 L180,200 L360,200 L360,80 L540,80 L540,200 L720,200" />
                    <path className="circuit-line" d="M720,200 L900,200 L900,100 L1080,100 L1080,250 L1260,250 L1260,150 L1440,150" />
                    <path className="circuit-line" d="M0,350 L200,350 L200,450 L400,450 L400,350 L600,350 L600,500 L800,500" />
                    <path className="circuit-line" d="M800,500 L1000,500 L1000,400 L1200,400 L1200,500 L1440,500" />
                    <path className="circuit-line" d="M0,600 L150,600 L150,700 L350,700 L350,600 L550,600 L550,750 L750,750" />
                    <path className="circuit-line" d="M750,750 L950,750 L950,650 L1150,650 L1150,750 L1440,750" />
                    <path className="circuit-line" d="M200,0 L200,80 L360,80" />
                    <path className="circuit-line" d="M800,0 L800,80 L540,80" />
                    <path className="circuit-line" d="M400,900 L400,700 L350,700" />
                    <path className="circuit-line" d="M900,900 L900,650 L950,650" />
                    <circle className="circuit-dot" cx="180" cy="100" r="1.5" />
                    <circle className="circuit-dot" cx="360" cy="200" r="1.5" />
                    <circle className="circuit-dot" cx="540" cy="80" r="1.5" />
                    <circle className="circuit-dot" cx="720" cy="200" r="1.5" />
                    <circle className="circuit-dot" cx="900" cy="100" r="1.5" />
                    <circle className="circuit-dot" cx="1080" cy="250" r="1.5" />
                    <circle className="circuit-dot" cx="1260" cy="150" r="1.5" />
                    <circle className="circuit-dot" cx="200" cy="350" r="1.5" />
                    <circle className="circuit-dot" cx="400" cy="450" r="1.5" />
                    <circle className="circuit-dot" cx="600" cy="350" r="1.5" />
                    <circle className="circuit-dot" cx="800" cy="500" r="1.5" />
                    <circle className="circuit-dot" cx="1000" cy="400" r="1.5" />
                    <circle className="circuit-dot" cx="1200" cy="500" r="1.5" />
                    <circle className="circuit-dot" cx="150" cy="600" r="1.5" />
                    <circle className="circuit-dot" cx="350" cy="700" r="1.5" />
                    <circle className="circuit-dot" cx="550" cy="600" r="1.5" />
                    <circle className="circuit-dot" cx="750" cy="750" r="1.5" />
                    <circle className="circuit-dot" cx="950" cy="650" r="1.5" />
                    <circle className="circuit-dot" cx="1150" cy="750" r="1.5" />
                </svg>
            </div>
            <CursorGlow />

            <header className="topbar">
                <div className="sidebar-intro">
                    <p className="sidebar-eyebrow">{copy.sidebar.title}</p>
                    <Link className="brand" to="/">
                        <img src={assetUrl(copy.logo || "/images/logo.jpg")} alt={copy.brand} className="brand-logo" />
                        <span className="brand-name">{copy.brand}</span>
                    </Link>
                    <p className="sidebar-text">{copy.sidebar.text}</p>
                </div>

                <button
                    type="button"
                    className={`nav-toggle ${isNavOpen ? "open" : ""}`}
                    onClick={() => setIsNavOpen((prev) => !prev)}
                    aria-label={locale === "ar" ? "فتح القائمة" : "Toggle menu"}
                    aria-expanded={isNavOpen}
                >
                    <span /><span /><span />
                </button>

                <nav className={`nav-links ${isNavOpen ? "open" : ""}`} aria-label="Primary">
                    {isHome ? (
                        <>
                            <a href="#services" className={activeSection === "services" ? "active-section" : ""} onClick={() => setIsNavOpen(false)}>{copy.nav.services}</a>
                            <a href="#showcase" className={activeSection === "showcase" ? "active-section" : ""} onClick={() => setIsNavOpen(false)}>{copy.nav.showcase}</a>
                            <a href="#process" className={activeSection === "process" ? "active-section" : ""} onClick={() => setIsNavOpen(false)}>{copy.nav.process}</a>
                            <a href="#contact" className={activeSection === "contact" ? "active-section" : ""} onClick={() => setIsNavOpen(false)}>{copy.nav.contact}</a>
                        </>
                    ) : (
                        <>
                            <Link to="/#services" onClick={() => setIsNavOpen(false)}>{copy.nav.services}</Link>
                            <Link to="/#showcase" onClick={() => setIsNavOpen(false)}>{copy.nav.showcase}</Link>
                            <Link to="/#process" onClick={() => setIsNavOpen(false)}>{copy.nav.process}</Link>
                            <Link to="/#contact" onClick={() => setIsNavOpen(false)}>{copy.nav.contact}</Link>
                        </>
                    )}
                    <Link to="/about" onClick={() => setIsNavOpen(false)}>{copy.nav.about}</Link>
                    <Link to="/portfolio" onClick={() => setIsNavOpen(false)}>{copy.nav.portfolio}</Link>
                </nav>

                <div className="sidebar-highlight">
                    <span className="sidebar-pill">{copy.sidebar.highlight}</span>
                    <span className="sidebar-subtext">{copy.sidebar.subtext}</span>
                </div>

                <div className="topbar-actions">
                    <button type="button" className="theme-toggle" onClick={toggleDark} aria-label={copy.themeLabel} title={copy.themeLabel}>
                        {isDark ? "☀️" : "🌙"}
                    </button>
                    <button type="button" className="button button-outline language-toggle" onClick={toggleLanguage}>
                        {copy.languageLabel}
                    </button>
                    <button type="button" className="button button-outline" onClick={handleShare}>
                        {locale === "ar" ? "مشاركة" : "Share"}
                    </button>
                    <button type="button" className="button button-dark" onClick={openProjectDialog}>
                        {copy.topAction}
                    </button>
                </div>
            </header>

            {isPageLoading ? (
                <main className="skeleton-page" aria-hidden="true">
                    <Skeleton />
                    <Skeleton height="clamp(80px,10vw,120px)" />
                    <Skeleton height="clamp(60px,8vw,100px)" />
                    <Skeleton height="clamp(60px,8vw,100px)" />
                    <Skeleton height="clamp(60px,8vw,100px)" />
                </main>
            ) : (
                <Outlet />
            )}

            <div className="footer">
                <p>{copy.footer}</p>
            </div>

            <BackToTop locale={copy} />
            <ToastContainer />
            <CookieConsent />

            {isProjectDialogOpen && (
                <div className="dialog-backdrop" role="presentation" onClick={closeProjectDialog}>
                    <div
                        className="project-dialog"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="project-dialog-title"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="project-dialog-header">
                            <div>
                                <p className="section-kicker">{copy.topAction}</p>
                                <h2 id="project-dialog-title">{copy.projectDialog.title}</h2>
                                <p>{copy.projectDialog.text}</p>
                            </div>
                            <button type="button" className="dialog-close" onClick={closeProjectDialog}>
                                {copy.projectDialog.close}
                            </button>
                        </div>

                        <form className="project-dialog-form" onSubmit={handleProjectSubmit}>
                            <div className="dialog-grid">
                                <label className="float-label">
                                    <span>{copy.projectDialog.fields.name}</span>
                                    <input type="text" name="name" value={projectBrief.name} onChange={handleProjectInputChange}
                                        placeholder={copy.projectDialog.placeholders.name} />
                                </label>
                                <label className="float-label">
                                    <span>{copy.projectDialog.fields.email}</span>
                                    <input type="email" name="email" value={projectBrief.email} onChange={handleProjectInputChange}
                                        placeholder={copy.projectDialog.placeholders.email} />
                                </label>
                                <label className="float-label">
                                    <span>{copy.projectDialog.fields.phone}</span>
                                    <input type="tel" inputMode="tel" name="phone" value={projectBrief.phone} onChange={handleProjectInputChange}
                                        placeholder={copy.projectDialog.placeholders.phone} />
                                </label>
                                <label className="float-label">
                                    <span>{copy.projectDialog.fields.projectType}</span>
                                    <input type="text" name="projectType" value={projectBrief.projectType} onChange={handleProjectInputChange}
                                        placeholder={copy.projectDialog.placeholders.projectType} />
                                </label>
                                <label className="float-label">
                                    <span>{copy.projectDialog.fields.budget}</span>
                                    <input type="text" name="budget" value={projectBrief.budget} onChange={handleProjectInputChange}
                                        placeholder={copy.projectDialog.placeholders.budget} />
                                </label>
                                <label className="float-label">
                                    <span>{copy.projectDialog.fields.timeline}</span>
                                    <input type="text" name="timeline" value={projectBrief.timeline} onChange={handleProjectInputChange}
                                        placeholder={copy.projectDialog.placeholders.timeline} />
                                </label>
                            </div>
                            <label className="float-label">
                                <span>{copy.projectDialog.fields.goals}</span>
                                <textarea name="goals" value={projectBrief.goals} onChange={handleProjectInputChange}
                                    placeholder={copy.projectDialog.placeholders.goals} rows="5" />
                            </label>
                            <p className="dialog-helper">{copy.projectDialog.helper}</p>
                            {projectStatus && (
                                <div className={`status ${projectStatus}`}>
                                    {projectStatus === "success" ? copy.projectDialog.success : copy.contactSection.status.error}
                                </div>
                            )}
                            <div className="dialog-actions">
                                <button type="button" className="button button-outline" onClick={closeProjectDialog}>
                                    {copy.projectDialog.close}
                                </button>
                                <button type="submit" className="button button-dark" disabled={isProjectSubmitting}>
                                    {isProjectSubmitting ? (locale === "ar" ? "جاري الإرسال..." : "Sending...") : copy.projectDialog.submit}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
