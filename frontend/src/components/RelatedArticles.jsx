import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const formatDate = (d) => {
  if (!d) return '';
  try { return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }); }
  catch { return ''; }
};

/**
 * Articles similaires — affichés en bas de chaque article.
 * Tire les articles de la même catégorie (exclut l'article courant).
 * Impact SEO : crée du maillage interne fort (liens sémantiquement liés).
 */
const RelatedArticles = ({ currentSlug, category, limit = 3 }) => {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    if (!category) return;
    const params = new URLSearchParams({ limit: limit + 1, exclude: currentSlug });
    if (category) params.set('category', category);
    axios.get(`${BACKEND_URL}/api/articles?${params}`)
      .then(r => setArticles((r.data || []).filter(a => a.slug !== currentSlug).slice(0, limit)))
      .catch(() => {});
  }, [currentSlug, category, limit]);

  if (!articles.length) return null;

  return (
    <section className="border-t border-gray-200 dark:border-gray-700 mt-12 pt-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 bg-blue-600 rounded-full" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Articles similaires</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {articles.map(article => (
          <Link
            key={article.slug}
            to={`/articles/${article.slug}`}
            className="group block rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md hover:border-blue-400 transition-all duration-200 bg-white dark:bg-gray-800"
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
            <div className="p-4">
              {article.category && (
                <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">{article.category}</span>
              )}
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mt-1 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {article.title}
              </h3>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock size={11} /> {formatDate(article.date_published || article.created_at)}
                </span>
                <span className="flex items-center gap-1 text-blue-600 font-medium group-hover:gap-2 transition-all">
                  Lire <ArrowRight size={12} />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RelatedArticles;
