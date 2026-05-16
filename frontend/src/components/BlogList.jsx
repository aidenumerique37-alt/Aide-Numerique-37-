import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Loader2, Search, ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const SITE_URL = 'https://www.aidenumerique37.fr';

const BlogList = () => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 9;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    fetchCategories();
    fetchArticles();
  }, []);

  useEffect(() => {
    fetchArticles();
    setCurrentPage(1);
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/articles/categories`);
      setCategories(response.data);
    } catch (err) {
      console.error('[BlogList] Error fetching categories:', err);
    }
  };

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      const response = await axios.get(`${BACKEND_URL}/api/articles`, { params });
      setArticles(response.data);
      setError(null);
    } catch (err) {
      console.error('[BlogList] Error fetching articles:', err);
      setError('Impossible de charger les articles pour le moment.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const filteredArticles = articles.filter(article => {
    if (!searchQuery) return true;
    const s = searchQuery.toLowerCase();
    return article.title.toLowerCase().includes(s) || article.excerpt?.toLowerCase().includes(s);
  });

  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
  const currentArticles = filteredArticles.slice((currentPage - 1) * articlesPerPage, currentPage * articlesPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  const handlePageChange = (p) => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const getPaginationNumbers = () => {
    const pages = [];
    if (totalPages <= 5) { for (let i = 1; i <= totalPages; i++) pages.push(i); }
    else if (currentPage <= 3) { pages.push(1, 2, 3, 4, '...', totalPages); }
    else if (currentPage >= totalPages - 2) { pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages); }
    else { pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages); }
    return pages;
  };

  if (loading && articles.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-20 bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors">
        <Helmet><title>Articles & Actualités | Aide Numérique 37 — Conseils Informatique</title></Helmet>
        <div className="max-w-7xl mx-auto px-4"><div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-french-blue" size={48} /></div></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">
      <Helmet>
        <title>Articles & Actualités | Aide Numérique 37 — Conseils Informatique</title>
        <meta name="description" content="Conseils et astuces en assistance informatique, sécurité numérique et formation seniors à domicile en Indre-et-Loire. Articles par Aide Numérique 37, expert informatique à Tours." />
        <meta property="og:title" content="Articles & Actualités | Aide Numérique 37" />
        <meta property="og:description" content="Conseils et astuces en assistance informatique, sécurité numérique et formation seniors à domicile en Indre-et-Loire. Articles par Aide Numérique 37, expert informatique à Tours." />
        <meta property="og:image" content="https://www.aidenumerique37.fr/logo.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}/articles`} />
        <meta property="og:site_name" content="Aide Numérique 37" />
        <meta property="og:locale" content="fr_FR" />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <link rel="canonical" href={`${SITE_URL}/articles`} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Blog",
          "name": "Articles | Aide Numérique 37",
          "url": `${SITE_URL}/articles`,
          "description": "Conseils informatique, sécurité numérique et formation seniors par Aide Numérique 37",
          "publisher": {
            "@type": "LocalBusiness",
            "name": "Aide Numérique 37",
            "url": SITE_URL
          }
        })}</script>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8" data-testid="blog-breadcrumb">
          <Link to="/" className="hover:text-french-blue transition-colors">Accueil</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-medium">Articles</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4" data-testid="blog-title">
            Articles & Actualit&eacute;s
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            D&eacute;couvrez nos conseils et astuces pour mieux utiliser vos outils num&eacute;riques au quotidien
          </p>

          {/* Search */}
          <div className="max-w-xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text" placeholder="Rechercher un article..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-6 text-lg border-2 border-gray-200 dark:border-gray-700 focus:border-french-blue rounded-lg"
                data-testid="blog-search-input"
              />
            </div>
            {searchQuery && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {filteredArticles.length} article{filteredArticles.length > 1 ? 's' : ''} trouv&eacute;{filteredArticles.length > 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2" data-testid="blog-category-filters">
              <button
                onClick={() => setSelectedCategory('')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === '' ? 'bg-french-blue text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-french-blue hover:text-french-blue'
                }`}
                data-testid="blog-category-all"
              >
                <Tag size={14} /> Tous
              </button>
              {categories.sort().map((cat) => (
                <button key={cat} onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === cat ? 'bg-french-blue text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-french-blue hover:text-french-blue'
                  }`}
                  data-testid={`blog-category-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 px-6 py-4 rounded-lg mb-8" data-testid="blog-error">{error}</div>
        )}

        {/* Empty */}
        {!loading && !error && filteredArticles.length === 0 && (
          <div className="text-center py-20" data-testid="blog-empty">
            <Calendar size={64} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
              {searchQuery ? 'Aucun article trouv\u00e9' : 'Aucun article pour le moment'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery ? "Essayez avec d'autres mots-cl\u00e9s" : 'Les premiers articles arriveront bient\u00f4t !'}
            </p>
            {(searchQuery || selectedCategory) && (
              <Button onClick={() => { setSearchQuery(''); setSelectedCategory(''); }} variant="outline"
                className="mt-4 border-2 border-french-blue text-french-blue hover:bg-french-blue hover:text-white" data-testid="blog-reset-filters">
                R&eacute;initialiser les filtres
              </Button>
            )}
          </div>
        )}

        {/* Articles Grid */}
        {currentArticles.length > 0 && (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="blog-articles-grid">
              {currentArticles.map((article) => (
                <Card key={article.slug}
                  className="group hover:shadow-xl transition-all duration-300 border-0 dark:border dark:border-gray-800 shadow-md dark:shadow-none hover:-translate-y-1 flex flex-col h-full overflow-hidden bg-white dark:bg-gray-900"
                  data-testid={`blog-article-card-${article.slug}`}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={article.image_url || 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&h=400&fit=crop'}
                      alt={article.title}
                      loading="lazy"
                      decoding="async"
                      width="600" height="400"
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&h=400&fit=crop'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                    <div className="absolute bottom-3 left-3 flex items-center gap-2 text-sm text-white">
                      <Calendar size={14} /><span>{formatDate(article.date_published)}</span>
                    </div>
                    {article.category && (
                      <div className="absolute top-3 right-3">
                        <span className="bg-french-blue/90 text-white text-xs font-medium px-2.5 py-1 rounded-full">{article.category}</span>
                      </div>
                    )}
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-gray-900 dark:text-white group-hover:text-french-blue transition-colors line-clamp-2">{article.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col pt-0">
                    <CardDescription className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4 flex-1 text-sm line-clamp-3">{article.excerpt}</CardDescription>
                    <Link to={`/articles/${article.slug}`}>
                      <Button variant="outline" className="w-full border-2 border-french-blue text-french-blue hover:bg-french-blue hover:text-white transition-all duration-300 group/btn"
                        data-testid={`blog-read-article-${article.slug}`}>
                        Lire l'article <ArrowRight className="ml-2 group-hover/btn:translate-x-1 transition-transform" size={18} />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex flex-col items-center gap-4" data-testid="blog-pagination">
                <div className="flex items-center gap-2">
                  <Button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} variant="outline"
                    className="border-2 border-french-blue text-french-blue hover:bg-french-blue hover:text-white disabled:opacity-50" data-testid="blog-prev-page">
                    <ChevronLeft size={20} /> Pr&eacute;c&eacute;dent
                  </Button>
                  <div className="flex items-center gap-2">
                    {getPaginationNumbers().map((page, index) => (
                      page === '...' ? (
                        <span key={`e-${index}`} className="px-2 text-gray-400">...</span>
                      ) : (
                        <Button key={page} onClick={() => handlePageChange(page)}
                          variant={currentPage === page ? "default" : "outline"}
                          className={currentPage === page
                            ? "bg-french-blue text-white hover:bg-french-blue/90 min-w-[40px]"
                            : "border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-french-blue hover:text-french-blue min-w-[40px]"
                          }>
                          {page}
                        </Button>
                      )
                    ))}
                  </div>
                  <Button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} variant="outline"
                    className="border-2 border-french-blue text-french-blue hover:bg-french-blue hover:text-white disabled:opacity-50" data-testid="blog-next-page">
                    Suivant <ChevronRight size={20} />
                  </Button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage} sur {totalPages} ({filteredArticles.length} article{filteredArticles.length > 1 ? 's' : ''})
                </p>
              </div>
            )}
          </>
        )}

        {/* Internal SEO Links */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Explorer le site</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            <Link to="/" className="flex items-center gap-2 text-french-blue hover:underline font-medium text-sm py-2">
              <ArrowRight size={14} /> Accueil
            </Link>
            <Link to="/a-propos" className="flex items-center gap-2 text-french-blue hover:underline font-medium text-sm py-2">
              <ArrowRight size={14} /> A propos
            </Link>
            <Link to="/services/assistance-informatique" className="flex items-center gap-2 text-french-blue hover:underline font-medium text-sm py-2">
              <ArrowRight size={14} /> Assistance Informatique
            </Link>
            <Link to="/services/depannage-domicile" className="flex items-center gap-2 text-french-blue hover:underline font-medium text-sm py-2">
              <ArrowRight size={14} /> Depannage a Domicile
            </Link>
            <Link to="/intervention/joue-les-tours" className="flex items-center gap-2 text-french-blue hover:underline font-medium text-sm py-2">
              <ArrowRight size={14} /> Intervention Joue-les-Tours
            </Link>
            <Link to="/intervention/tours" className="flex items-center gap-2 text-french-blue hover:underline font-medium text-sm py-2">
              <ArrowRight size={14} /> Intervention Tours
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogList;
