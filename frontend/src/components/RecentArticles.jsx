import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const formatDate = (d) => {
  if (!d) return '';
  try { return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }); }
  catch { return ''; }
};

/**
 * Derniers articles — bloc réutilisable pour homepage, services, villes.
 * Paramètres :
 *  - limit : nombre d'articles (défaut 3)
 *  - category : filtre par catégorie (optionnel)
 *  - exclude : slug à exclure (optionnel)
 *  - title : titre de la section (défaut "Nos derniers articles")
 *  - compact : affichage compact (liste) vs cartes (défaut false)
 */
const RecentArticles = ({ limit = 3, category = null, exclude = null, title = "Nos derniers articles", compact = false }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams({ limit: limit + (exclude ? 1 : 0) });
    if (category) params.set('category', category);
    axios.get(`${BACKEND_URL}/api/articles?${params}`)
      .then(r => {
        let data = r.data || [];
        if (exclude) data = data.filter(a => a.slug !== exclude);
        setArticles(data.slice(0, limit));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [limit, category, exclude]);

  if (loading || !articles.length) return null;

  if (compact) {
    return (
      <section className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen size={16} className="text-blue-600" />
          <h3 className="font-bold text-gray-900 dark:text-white text-base">{title}</h3>
        </div>
        <ul className="space-y-2">
          {articles.map(article => (
            <li key={article.slug}>
              <Link
                to={`/articles/${article.slug}`}
                className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
              >
                <ArrowRight size={14} className="mt-0.5 shrink-0 text-blue-500 group-hover:translate-x-0.5 transition-transform" />
                <span className="line-clamp-2">{article.title}</span>
              </Link>
            </li>
          ))}
        </ul>
        <Link to="/articles" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline">
          Tous nos articles <ArrowRight size={11} />
        </Link>
      </section>
    );
  }

  return (
    <section className="py-14 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1 h-7 bg-blue-600 rounded-full" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
          </div>
          <Link to="/articles" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline">
            Voir tous les articles <ArrowRight size={14} />
          </Link>
        </div>
        <div className={`grid gap-6 ${limit === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
          {articles.map(article => (
            <Link
              key={article.slug}
              to={`/articles/${article.slug}`}
              className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-blue-300 transition-all duration-200"
            >
              {article.featured_image && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={article.featured_image}
                    alt={article.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-5">
                {article.category && (
                  <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{article.category}</span>
                )}
                <h3 className="text-base font-bold text-gray-900 dark:text-white mt-1.5 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {article.title}
                </h3>
                {article.excerpt && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{article.excerpt}</p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock size={11} /> {formatDate(article.date_published || article.created_at)}
                  </span>
                  <span className="flex items-center gap-1 text-blue-600 font-semibold group-hover:gap-2 transition-all">
                    Lire <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="sm:hidden mt-6 text-center">
          <Link to="/articles" className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 border border-blue-600 rounded-lg px-4 py-2 hover:bg-blue-50 transition-colors">
            Voir tous les articles <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default RecentArticles;
