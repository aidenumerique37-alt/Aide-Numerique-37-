import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const SITE_URL = 'https://www.aidenumerique37.fr';

/**
 * Generic legal page loader — fetches content from /api/legal/:pageType
 * and renders it as sanitized HTML via Tailwind prose.
 */
const LegalPage = ({ pageType, canonicalPath, metaDescription }) => {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get(`${BACKEND_URL}/api/legal/${pageType}`)
      .then(res => setPage(res.data))
      .catch(() => setPage({ title: '', content_html: '' }))
      .finally(() => setLoading(false));
  }, [pageType]);

  const title = page?.title || '';
  const htmlContent = page?.content_html || '';

  return (
    <div className="pt-24 pb-20 min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <Helmet>
        <title>{title ? `${title} | Aide Numérique 37` : 'Aide Numérique 37'}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={`${SITE_URL}${canonicalPath}`} />
        <meta property="og:title" content={`${title} | Aide Numérique 37`} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={`${SITE_URL}${canonicalPath}`} />
        <meta property="og:site_name" content="Aide Numérique 37" />
        <meta property="og:locale" content="fr_FR" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
          <Link to="/" className="hover:text-french-blue transition-colors">Accueil</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-medium">{title}</span>
        </nav>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-lg w-2/3" />
            {[1,2,3,4].map(i => (
              <div key={i} className="space-y-2">
                <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
                <div className="h-4 bg-gray-100 dark:bg-gray-800/60 rounded w-full" />
                <div className="h-4 bg-gray-100 dark:bg-gray-800/60 rounded w-5/6" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-10">
              {title}
            </h1>

            <div
              className="prose prose-blue dark:prose-invert max-w-none
                prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
                prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3
                prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2
                prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed
                prose-li:text-gray-700 dark:prose-li:text-gray-300
                prose-a:text-french-blue prose-a:no-underline hover:prose-a:underline
                prose-strong:text-gray-900 dark:prose-strong:text-white"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />

            {/* Footer nav */}
            <div className="mt-14 pt-8 border-t border-gray-200 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Autres pages légales</h3>
              <div className="flex flex-wrap gap-3">
                {[
                  { to: '/mentions-legales', label: 'Mentions légales' },
                  { to: '/cgv', label: 'CGV' },
                  { to: '/politique-de-confidentialite', label: 'Politique de confidentialité' },
                ].filter(l => l.to !== canonicalPath).map(l => (
                  <Link
                    key={l.to}
                    to={l.to}
                    className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 hover:border-french-blue hover:text-french-blue transition-colors"
                  >
                    {l.label}
                  </Link>
                ))}
                <Link
                  to="/"
                  className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 hover:border-french-blue hover:text-french-blue transition-colors"
                >
                  ← Accueil
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LegalPage;
