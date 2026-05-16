import React, { useEffect, useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Loader2, Home, Search } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * Gère les anciens URLs WordPress (/{slug}) et redirige vers /articles/{slug}
 * si l'article existe. Sinon affiche une page 404.
 * Fix SEO : Google indexait l'ancien site WP avec /{slug}, maintenant le site
 * React répond avec noindex. Ce composant résout le problème en redirigeant.
 */
const LegacyArticleRedirect = () => {
  const { slug } = useParams();
  const [status, setStatus] = useState('loading'); // 'loading' | 'redirect' | 'notfound'

  useEffect(() => {
    if (!slug) { setStatus('notfound'); return; }
    axios.get(`${BACKEND_URL}/api/articles/${slug}`)
      .then(() => setStatus('redirect'))
      .catch(() => setStatus('notfound'));
  }, [slug]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <Helmet>
          <title>Redirection... | Aide Numérique 37</title>
          <meta name="robots" content="noindex, follow" />
        </Helmet>
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (status === 'redirect') {
    return <Navigate to={`/articles/${slug}`} replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4">
      <Helmet>
        <title>Page introuvable | Aide Numérique 37</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="Page introuvable - Aide Numérique 37" />
      </Helmet>
      <div className="text-center max-w-lg">
        <div className="text-8xl font-bold text-blue-600/20 mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Page introuvable</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {"La page que vous recherchez n'existe pas ou a été déplacée."}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-md">
            <Home size={18} /> Retour à l'accueil
          </Link>
          <Link to="/articles" className="inline-flex items-center gap-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-600 hover:text-blue-600 font-semibold px-6 py-3 rounded-xl transition-all">
            <Search size={18} /> Nos articles
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LegacyArticleRedirect;
