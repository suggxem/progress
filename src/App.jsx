import { Routes, Route } from "react-router-dom"
import Layout from "./layout/Layout"
import Home from "./pages/Home"
import About from "./pages/About"
import ServicesPage from "./pages/ServicesPage"
import Portfolio from "./pages/Portfolio"
import ContactPage from "./pages/ContactPage"
import Privacy from "./pages/Privacy"


// Auth0 dependencies--------------------------------------------------------------------------
import { useAuth0 } from '@auth0/auth0-react';
import LoginButton from './Auth0_Moduls/LoginButton';
import LogoutButton from './Auth0_Moduls/LogoutButton';
import Profile from './Auth0_Moduls/Profile';

function App() {
  const { isAuthenticated, isLoading, error } = useAuth0();

  if (isLoading) {
    return (
      <div className="app-container">
        <div className="loading-state">
          <div className="loading-text">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <div className="error-state">
          <div className="error-title">Oops!</div>
          <div className="error-message">Something went wrong</div>
          <div className="error-sub-message">{error.message}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="main-card-wrapper">
        <img
          src="https://cdn.auth0.com/quantum-assets/dist/latest/logos/auth0/auth0-lockup-en-ondark.png"
          alt="Auth0 Logo"
          className="auth0-logo"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <h1 className="main-title">Welcome to Sample0</h1>

        {isAuthenticated ? (
          <div className="logged-in-section">
            <div className="logged-in-message">✅ Successfully authenticated!</div>
            <h2 className="profile-section-title">Your Profile</h2>
            <div className="profile-card">
              <Profile />
            </div>
            <LogoutButton />
          </div>
        ) : (
          <div className="action-card">
            <p className="action-text">Get started by signing in to your account</p>
            <LoginButton />
          </div>
        )}
      </div>




    // Auth0 Code----------------==============================---------------------=============---------



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
    </div>
  );
}

export default App;

//---------------------------------------------------------------------------




