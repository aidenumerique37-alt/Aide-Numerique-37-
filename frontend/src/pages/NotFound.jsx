import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Home, ArrowLeft, Search } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4">
      <Helmet>
        <title>Page introuvable | Aide Numérique 37</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="Page introuvable - Aide Numérique 37" />
      </Helmet>
      <div className="text-center max-w-lg">
        <div className="text-8xl font-bold text-french-blue/20 mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Page introuvable</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {"La page que vous recherchez n'existe pas ou a été déplacée."}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="inline-flex items-center gap-2 bg-french-blue hover:bg-french-blue/90 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-md">
            <Home size={18} /> Retour à l'accueil
          </Link>
          <Link to="/articles" className="inline-flex items-center gap-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-french-blue hover:text-french-blue font-semibold px-6 py-3 rounded-xl transition-all">
            <Search size={18} /> Nos articles
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
