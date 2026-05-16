import React from 'react';
import { Heart, Phone, Mail, Clock, Cookie } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCookieConsent } from '../context/CookieConsentContext';
import { OpenStatusBadge } from './OpenStatusBadge';

const contactInfo = {
  phone: "07 61 50 35 85",
  email: "aidenumerique37@gmail.com",
  location: "Indre-et-Loire (37)"
};

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { reset } = useCookieConsent();

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 dark:border-t dark:border-gray-800 text-gray-300 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Left - Brand */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold text-white mb-4">
              Aide Numérique 37
            </h3>
            <p className="text-gray-400 leading-relaxed mb-5">
              Votre assistant numérique à domicile en Indre-et-Loire. 
              Service à la Personne agréé avec crédit d'impôt de 50%.
            </p>
            <OpenStatusBadge variant="full" />
          </div>

          {/* Center Left - Quick Links Column 1 */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">
              Navigation
            </h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-400 hover:text-french-blue transition-colors"
                >
                  Services
                </button>
              </li>
              <li>
                <Link
                  to="/credit-impot"
                  className="text-gray-400 hover:text-french-blue transition-colors"
                >
                  Crédit d'Impôt & Avance Immédiate
                </Link>
              </li>
              <li>
                <button 
                  onClick={() => document.getElementById('avis')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-400 hover:text-french-blue transition-colors"
                >
                  Avis Clients
                </button>
              </li>
              <li>
                <button 
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-400 hover:text-french-blue transition-colors"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Center Right - Quick Links Column 2 */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">
              Informations
            </h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/a-propos"
                  className="text-gray-400 hover:text-french-blue transition-colors"
                >
                  A propos
                </Link>
              </li>
              <li>
                <Link 
                  to="/articles"
                  className="text-gray-400 hover:text-french-blue transition-colors"
                >
                  Articles
                </Link>
              </li>
              <li>
                <Link
                  to="/mentions-legales"
                  className="text-gray-400 hover:text-french-blue transition-colors"
                >
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link
                  to="/cgv"
                  className="text-gray-400 hover:text-french-blue transition-colors"
                >
                  CGV
                </Link>
              </li>
              <li>
                <Link
                  to="/politique-de-confidentialite"
                  className="text-gray-400 hover:text-french-blue transition-colors"
                >
                  Confidentialité
                </Link>
              </li>
              <li>
                <button
                  onClick={reset}
                  className="text-gray-400 hover:text-french-blue transition-colors flex items-center gap-1.5"
                >
                  <Cookie size={14} />
                  Gérer les cookies
                </button>
              </li>
              <li>
                <Link to="/intervention/joue-les-tours" className="text-gray-400 hover:text-french-blue transition-colors">
                  Joue-les-Tours
                </Link>
              </li>
              <li>
                <Link to="/intervention/chambray-les-tours" className="text-gray-400 hover:text-french-blue transition-colors">
                  Chambray-les-Tours
                </Link>
              </li>
              <li>
                <Link to="/intervention/tours" className="text-gray-400 hover:text-french-blue transition-colors">
                  Tours
                </Link>
              </li>
              <li>
                <a 
                  href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
                  className="text-gray-400 hover:text-french-blue transition-colors flex items-center gap-2"
                >
                  <Phone size={16} />
                  {contactInfo.phone}
                </a>
              </li>
              <li>
                <a 
                  href={`mailto:${contactInfo.email}`}
                  className="text-gray-400 hover:text-french-blue transition-colors flex items-center gap-2"
                >
                  <Mail size={16} />
                  {contactInfo.email}
                </a>
              </li>
              <li className="text-gray-400 flex items-start gap-2 pt-1" data-testid="footer-hours">
                <Clock size={16} className="mt-0.5 shrink-0" />
                <span>
                  <span className="block text-white font-medium text-sm">7j/7 — 8h30 à 20h</span>
                  <span className="text-xs">Lun. – Dim. (Dim. &amp; fériés sur RDV)</span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm">
              © {currentYear} Aide Numérique 37. Tous droits réservés.
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <span>Créé avec</span>
              <Heart size={16} className="fill-french-red text-french-red" />
              <span>en Indre-et-Loire</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
