import React from 'react';
import { Heart, Phone, Mail, Clock, Cookie, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCookieConsent } from '../context/CookieConsentContext';
import { OpenStatusBadge } from './OpenStatusBadge';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { reset } = useCookieConsent();

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 dark:border-t dark:border-gray-800 text-gray-400 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">

        {/* ── Grille principale ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Col 1 — Marque */}
          <div className="lg:col-span-1">
            <h3 className="text-white font-bold text-lg mb-3 tracking-tight">
              Aide Numérique 37
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-5">
              Assistance informatique à domicile en Indre-et-Loire. Service à la Personne agréé — crédit d'impôt 50 %.
            </p>
            <OpenStatusBadge variant="full" />
          </div>

          {/* Col 2 — Navigation */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-400 hover:text-white transition-colors text-left">
                  Services
                </button>
              </li>
              <li>
                <Link to="/credit-impot" className="text-gray-400 hover:text-white transition-colors">
                  Crédit d'impôt & Avance immédiate
                </Link>
              </li>
              <li>
                <button onClick={() => document.getElementById('avis')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-400 hover:text-white transition-colors text-left">
                  Avis clients
                </button>
              </li>
              <li>
                <Link to="/a-propos" className="text-gray-400 hover:text-white transition-colors">
                  À propos
                </Link>
              </li>
              <li>
                <Link to="/articles" className="text-gray-400 hover:text-white transition-colors">
                  Articles
                </Link>
              </li>
              <li>
                <button onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-400 hover:text-white transition-colors text-left">
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3 — Zones & légal */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-4">
              Zones & Légal
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/intervention/joue-les-tours" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5">
                  <MapPin size={13} className="shrink-0" /> Joué-lès-Tours
                </Link>
              </li>
              <li>
                <Link to="/intervention/chambray-les-tours" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5">
                  <MapPin size={13} className="shrink-0" /> Chambray-lès-Tours
                </Link>
              </li>
              <li>
                <Link to="/intervention/tours" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5">
                  <MapPin size={13} className="shrink-0" /> Tours
                </Link>
              </li>
              <li className="pt-2 border-t border-gray-800">
                <Link to="/mentions-legales" className="text-gray-400 hover:text-white transition-colors">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link to="/cgv" className="text-gray-400 hover:text-white transition-colors">
                  CGV
                </Link>
              </li>
              <li>
                <Link to="/politique-de-confidentialite" className="text-gray-400 hover:text-white transition-colors">
                  Confidentialité
                </Link>
              </li>
              <li>
                <button
                  onClick={() => reset()}
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Cookie size={13} className="shrink-0" /> Gérer les cookies
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4 — Contact */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-4">
              Contact
            </h4>
            <ul className="space-y-4 text-sm">
              <li>
                <a href="tel:0761503585" className="flex items-center gap-2.5 text-gray-400 hover:text-white transition-colors group">
                  <div className="w-8 h-8 rounded-md bg-gray-800 group-hover:bg-gray-700 flex items-center justify-center shrink-0 transition-colors">
                    <Phone size={14} />
                  </div>
                  <span className="font-medium text-white">07 61 50 35 85</span>
                </a>
              </li>
              <li>
                <a href="mailto:aidenumerique37@gmail.com" className="flex items-center gap-2.5 text-gray-400 hover:text-white transition-colors group">
                  <div className="w-8 h-8 rounded-md bg-gray-800 group-hover:bg-gray-700 flex items-center justify-center shrink-0 transition-colors">
                    <Mail size={14} />
                  </div>
                  <span className="break-all">aidenumerique37@gmail.com</span>
                </a>
              </li>
              <li className="flex items-start gap-2.5" data-testid="footer-hours">
                <div className="w-8 h-8 rounded-md bg-gray-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock size={14} />
                </div>
                <div>
                  <span className="block text-white font-medium">7j/7 — 8h30 à 20h</span>
                  <span className="text-xs text-gray-500">Dim. & fériés sur RDV</span>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* ── Bas de page ── */}
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-gray-500 text-xs">
            © {currentYear} Aide Numérique 37. Tous droits réservés.
          </span>
          <span className="flex items-center gap-1.5 text-gray-500 text-xs">
            Créé avec <Heart size={13} className="fill-red-500 text-red-500" /> en Indre-et-Loire
          </span>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
