import React, { useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { HelmetProvider, Helmet } from "react-helmet-async";
import { ThemeProvider } from "./context/ThemeContext";
import { CookieConsentProvider } from "./context/CookieConsentContext";
import CookieBanner from "./components/CookieBanner";
import GoogleAnalytics from "./components/GoogleAnalytics";
import SplashScreen from "./components/SplashScreen";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Services from "./components/Services";
import UrssafInfo from "./components/UrssafInfo";
import Reviews from "./components/Reviews";
import Partners from "./components/Partners";
import Contact from "./components/Contact";
import Press from "./components/Press";
import HowItWorks from "./components/HowItWorks";
import SpecialPricing from "./components/SpecialPricing";
import Footer from "./components/Footer";
import BlogList from "./components/BlogList";
import BlogDetail from "./components/BlogDetail";
import About from "./components/About";
import AdminPanel from "./components/AdminPanel";
import ServiceDetail from "./pages/ServiceDetail";
import MentionsLegales from "./pages/MentionsLegales";
import CGVPage from "./pages/CGVPage";
import PrivacyPage from "./pages/PrivacyPage";
import CityPage from "./pages/CityPage";
import NotFound from "./pages/NotFound";
import FAQPage from "./pages/FAQPage";
import ProPage from "./pages/ProPage";
import CreditImpotPage from "./pages/CreditImpotPage";
import LegacyArticleRedirect from "./pages/LegacyArticleRedirect";
import Realisations from "./pages/Realisations";
import FadeInSection from "./components/FadeInSection";
import LocalFAQ from "./components/LocalFAQ";
import StickyMobileCTA from "./components/StickyMobileCTA";
import RecentArticles from "./components/RecentArticles";

const CANONICAL_SITE = 'https://www.aidenumerique37.fr';

/* Remove trailing slashes to prevent duplicate URLs in Google */
const TrailingSlashRedirect = () => {
  const { pathname, search, hash } = useLocation();
  if (pathname !== '/' && pathname.endsWith('/')) {
    return <Navigate to={`${pathname.slice(0, -1)}${search}${hash}`} replace />;
  }
  return null;
};

/* Block WordPress parasite URL parameters (wptouch, taxonomy, etc.) */
const PARASITE_PARAMS = ['wptouch_switch', 'taxonomy', 'p', 'cat', 'tag', 'author', 'feed', 'attachment_id', 'replytocom', 's', 'lang', 'ver'];

const ParasiteParamGuard = () => {
  const { pathname, search } = useLocation();
  const params = new URLSearchParams(search);
  const hasParasite = PARASITE_PARAMS.some(p => params.has(p));
  if (!hasParasite) return null;
  const cleanUrl = `${CANONICAL_SITE}${pathname}`;
  return (
    <Helmet>
      <link rel="canonical" href={cleanUrl} />
      <meta name="robots" content="noindex, follow" />
    </Helmet>
  );
};

const SECTION_MAP = {
  reviews: Reviews,
  services: Services,
  howItWorks: HowItWorks,
  urssafInfo: UrssafInfo,
  specialPricing: SpecialPricing,
  press: Press,
  contact: Contact,
  partners: Partners,
};

const DEFAULT_ORDER = ['reviews', 'services', 'howItWorks', 'urssafInfo', 'specialPricing', 'press', 'contact', 'partners'];

const Home = () => {
  const [sectionOrder, setSectionOrder] = React.useState(DEFAULT_ORDER);

  React.useEffect(() => {
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
    fetch(`${BACKEND_URL}/api/admin/content`)
      .then(r => r.json())
      .then(data => {
        if (data.section_order && Array.isArray(data.section_order) && data.section_order.length > 0) {
          // Ensure new sections added over time are auto-inserted for existing installs
          let order = [...data.section_order];
          if (!order.includes('specialPricing')) {
            // Insert right after urssafInfo if present, else append before 'contact'
            const idx = order.indexOf('urssafInfo');
            if (idx >= 0) order.splice(idx + 1, 0, 'specialPricing');
            else {
              const ci = order.indexOf('contact');
              if (ci >= 0) order.splice(ci, 0, 'specialPricing');
              else order.push('specialPricing');
            }
          }
          setSectionOrder(order);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <Helmet>
        <link rel="canonical" href={CANONICAL_SITE} />
        <meta property="og:url" content={CANONICAL_SITE} />
      </Helmet>
      <Header />
      <main>
        <Hero />
        {sectionOrder.map((key) => {
          const Component = SECTION_MAP[key];
          if (!Component) return null;
          return <FadeInSection key={key}><Component /></FadeInSection>;
        })}
        {/* Maillage interne — section "Nos derniers articles" après le contact */}
        <FadeInSection>
          <RecentArticles limit={3} title="Nos derniers articles" />
        </FadeInSection>
      </main>
      <Footer />
      <StickyMobileCTA />
    </div>
  );
};

const BlogPage = () => {
  return (
    <div>
      <Header />
      <main>
        <BlogList />
      </main>
      <Footer />
    </div>
  );
};

const BlogDetailPage = () => {
  return (
    <div>
      <Header />
      <main>
        <BlogDetail />
      </main>
      <Footer />
    </div>
  );
};

const AboutPage = () => {
  return (
    <div>
      <Header />
      <main>
        <About />
      </main>
      <Footer />
    </div>
  );
};

const ServicePage = () => {
  return (
    <div>
      <Header />
      <main>
        <ServiceDetail />
      </main>
      <Footer />
      <StickyMobileCTA />
    </div>
  );
};

const MentionsPage = () => {
  return (
    <div>
      <Header />
      <main>
        <MentionsLegales />
      </main>
      <Footer />
    </div>
  );
};

const CityPageLayout = () => {
  return (
    <div>
      <Header />
      <main>
        <CityPage />
      </main>
      <Footer />
      <StickyMobileCTA />
    </div>
  );
};

const NotFoundPage = () => {
  return (
    <div>
      <Header />
      <main>
        <NotFound />
      </main>
      <Footer />
    </div>
  );
};

const FAQLayout = () => {
  return (
    <div>
      <Header />
      <main>
        <FAQPage />
      </main>
      <Footer />
      <StickyMobileCTA />
    </div>
  );
};

function App() {
  // Show splash only on the very first page-load (not on back-navigation or route changes)
  const [splashDone, setSplashDone] = useState(
    () => sessionStorage.getItem('splash_shown') === '1'
  );

  const handleSplashComplete = () => {
    sessionStorage.setItem('splash_shown', '1');
    setSplashDone(true);
  };

  return (
    <HelmetProvider>
    <ThemeProvider>
    <CookieConsentProvider>
    <div className="App min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      {/* Splash screen — only on first load, not on /admin */}
      {!splashDone && !window.location.pathname.startsWith('/admin') && (
        <SplashScreen duration={5500} onComplete={handleSplashComplete} />
      )}
      <BrowserRouter>
        <TrailingSlashRedirect />
        <ParasiteParamGuard />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/articles" element={<BlogPage />} />
          <Route path="/articles/:slug" element={<BlogDetailPage />} />
          <Route path="/a-propos" element={<AboutPage />} />
          <Route path="/services/:slug" element={<ServicePage />} />
          <Route path="/mentions-legales" element={<MentionsPage />} />
          <Route path="/cgv" element={<CGVPage />} />
          <Route path="/politique-de-confidentialite" element={<PrivacyPage />} />
          <Route path="/faq" element={<FAQLayout />} />
          <Route path="/pro" element={<ProPage />} />
          <Route path="/realisations" element={<Realisations />} />
          <Route path="/credit-impot" element={<CreditImpotPage />} />
          <Route path="/avance-immediate" element={<Navigate to="/credit-impot" replace />} />
          <Route path="/avantages-fiscaux" element={<Navigate to="/credit-impot" replace />} />
          <Route path="/intervention/:slug" element={<CityPageLayout />} />
          <Route path="/admin" element={<AdminPanel />} />
          {/* Anciens URLs WordPress /category/* → redirection vers /articles */}
          <Route path="/category" element={<Navigate to="/articles" replace />} />
          <Route path="/category/*" element={<Navigate to="/articles" replace />} />
          {/* Anciens URLs WordPress /{slug} → redirection vers /articles/{slug} si l'article existe */}
          <Route path="/:slug" element={<LegacyArticleRedirect />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <CookieBanner />
        <GoogleAnalytics />
      </BrowserRouter>
    </div>
    </CookieConsentProvider>
    </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
