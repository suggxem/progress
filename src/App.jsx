import { Routes, Route } from "react-router-dom"
import Layout from "./layout/Layout"
import Home from "./pages/Home"
import About from "./pages/About"
import ServicesPage from "./pages/ServicesPage"
import Portfolio from "./pages/Portfolio"
import ContactPage from "./pages/ContactPage"
import Privacy from "./pages/Privacy"

export default function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/privacy" element={<Privacy />} />
            </Route>
        </Routes>
    )
}
