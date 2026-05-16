import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Phone, Menu, X, Sun, Moon, ChevronRight, Home, Monitor, Shield, Star, Mail, User, BookOpen, ArrowRight, HelpCircle, Briefcase } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { OpenStatusBadge } from './OpenStatusBadge';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [services, setServices] = useState([]);
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    axios.get(`${BACKEND_URL}/api/services`).then(res => setServices(res.data)).catch(() => {});
  }, []);

  useEffect(() => { setIsMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  const scrollToSection = (sectionId) => {
    setIsMenuOpen(false);
    if (!isHomePage) { window.location.href = `/#${sectionId}`; return; }
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isHomePage && window.location.hash) {
      const hash = window.location.hash.substring(1);
      setTimeout(() => { document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' }); }, 100);
    }
  }, [isHomePage]);

  const navItems = [
    { label: 'Accueil', icon: Home, action: () => { setIsMenuOpen(false); if (isHomePage) window.location.reload(); else window.location.href = '/'; } },
    { label: 'Avantages Fiscaux', icon: Shield, to: '/credit-impot' },
    { label: 'Avis Clients', icon: Star, action: () => scrollToSection('avis') },
    { label: 'FAQ', icon: HelpCircle, to: '/faq' },
    { label: 'Contact', icon: Mail, action: () => scrollToSection('contact') },
    { label: 'À propos', icon: User, to: '/a-propos' },
    { label: 'Les conseils de Pierrick', icon: BookOpen, to: '/articles' },
    { label: 'Espace Professionnel', icon: Briefcase, to: '/pro' },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md shadow-sm dark:shadow-gray-900/50 dark:border-b dark:border-gray-800/50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link
              to="/"
              onClick={() => { setIsMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="flex items-center gap-3 cursor-pointer"
              data-testid="header-logo-link"
            >
              <img
                src="/logo.png"
                alt="Aide Numérique 37 - Assistance Informatique à Domicile"
                className="h-10 w-auto"
              />
              <h1 className="text-xl sm:text-2xl font-bold text-french-blue" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Aide Numérique 37
              </h1>
            </Link>

            <div className="flex items-center gap-2 sm:gap-3" data-testid="header-controls">
              <OpenStatusBadge variant="compact" className="hidden md:inline-flex" />
              <Link
                to="/pro"
                className="hidden lg:inline-flex items-center gap-1.5 border border-french-blue/30 text-french-blue hover:bg-french-blue/5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                data-testid="header-pro-link"
              >
                <Briefcase size={13} />
                Espace Pro
              </Link>
              <a
                href="tel:0761503585"
                className="hidden sm:inline-flex items-center gap-2 bg-french-red hover:bg-french-red/90 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-all"
                data-testid="header-phone-link"
              >
                <Phone size={16} />
                07 61 50 35 85
              </a>
              <button
                onClick={toggleTheme}
                className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-cyan-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                aria-label={isDark ? 'Mode clair' : 'Mode sombre'}
                data-testid="theme-toggle"
              >
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button
                className="relative w-10 h-10 rounded-xl flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                data-testid="hamburger-menu-button"
                aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              >
                <span className={`transition-all duration-300 ${isMenuOpen ? 'rotate-90 scale-110' : ''}`}>
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Full-screen overlay menu */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 ease-out ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        data-testid="nav-menu"
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-white dark:bg-gray-950" onClick={() => setIsMenuOpen(false)} />

        {/* Menu content */}
        <div className="relative h-full flex flex-col pt-24 pb-8 overflow-y-auto">
          <div className="max-w-5xl w-full mx-auto px-6 sm:px-8 lg:px-12 flex-1 flex flex-col justify-center">

            {/* Navigation grid */}
            <nav className="mb-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" data-testid="nav-grid">
                {navItems.map((item, i) => {
                  const Icon = item.icon;
                  const inner = (
                    <span className={`flex items-center gap-4 p-4 rounded-2xl border border-transparent hover:border-french-blue/20 hover:bg-french-blue/5 dark:hover:bg-french-blue/10 transition-all duration-200 group/nav
                      ${isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}
                    `}
                    style={{ transitionDelay: `${80 + i * 40}ms` }}
                    >
                      <span className="w-11 h-11 rounded-xl bg-french-blue/10 dark:bg-french-blue/20 flex items-center justify-center flex-shrink-0 group-hover/nav:bg-french-blue group-hover/nav:shadow-lg transition-all duration-300">
                        <Icon size={20} className="text-french-blue group-hover/nav:text-white transition-colors duration-300" />
                      </span>
                      <span className="flex-1">
                        <span className="block text-base font-semibold text-gray-900 dark:text-white group-hover/nav:text-french-blue transition-colors">{item.label}</span>
                      </span>
                      <ChevronRight size={16} className="text-gray-300 dark:text-gray-600 group-hover/nav:text-french-blue group-hover/nav:translate-x-1 transition-all duration-300" />
                    </span>
                  );

                  if (item.to) {
                    return <Link key={i} to={item.to} className="block">{inner}</Link>;
                  }
                  return <button key={i} onClick={item.action} className="block w-full text-left">{inner}</button>;
                })}
              </div>
            </nav>

            {/* Services section */}
            <div className={`mb-10 transition-all duration-300 ${isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ transitionDelay: '250ms' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-french-blue flex items-center justify-center">
                  <Monitor size={16} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Nos Services</h3>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2" data-testid="services-submenu">
                <button
                  onClick={() => scrollToSection('services')}
                  className="text-left px-4 py-3 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-french-blue hover:bg-french-blue/5 dark:hover:bg-french-blue/10 transition-all duration-200 flex items-center gap-2 group/svc"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-french-blue/40 group-hover/svc:bg-french-blue transition-colors" />
                  Tous les services
                </button>
                {services.map(svc => (
                  <Link
                    key={svc.id}
                    to={`/services/${svc.slug}`}
                    className="px-4 py-3 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-french-blue hover:bg-french-blue/5 dark:hover:bg-french-blue/10 transition-all duration-200 flex items-center gap-2 group/svc"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-french-blue/40 group-hover/svc:bg-french-blue transition-colors" />
                    {svc.title}
                  </Link>
                ))}
              </div>
            </div>

            {/* Bottom CTA */}
            <div className={`transition-all duration-300 ${isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ transitionDelay: '320ms' }}>
              <div className="bg-gradient-to-r from-french-blue to-sky-blue rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-white text-center sm:text-left">
                  <p className="font-bold text-lg">{"Besoin d'aide informatique ?"}</p>
                  <p className="text-blue-100 text-sm">{"Intervention rapide à domicile — 25€/h après crédit d'impôt"}</p>
                </div>
                <a
                  href="tel:0761503585"
                  className="flex items-center gap-2 bg-white text-french-blue font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 flex-shrink-0"
                >
                  <Phone size={18} />
                  07 61 50 35 85
                  <ArrowRight size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
