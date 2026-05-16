import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, ArrowLeft, ArrowRight, Loader2, AlertCircle, User, Clock, ChevronRight, Phone, List } from 'lucide-react';
import { Button } from './ui/button';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { sanitizeHtml } from '../utils/sanitize';
import RelatedArticles from './RelatedArticles';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const SITE_URL = 'https://www.aidenumerique37.fr';

/** Résout une URL image — ajoute le BACKEND_URL si chemin relatif (/api/...) */
const resolveImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${BACKEND_URL}${url}`;
};

const TableOfContents = ({ content }) => {
  const [headings, setHeadings] = useState([]);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const h2Elements = doc.querySelectorAll('h2, h3');
    const extractedHeadings = Array.from(h2Elements).map((el, index) => {
      const text = el.textContent.trim();
      const slug = text.toLowerCase().replace(/[^a-z0-9àâäéèêëïîôùûüç\s-]/g, '').replace(/\s+/g, '-').substring(0, 50);
      return { id: `heading-${index}`, text, level: el.tagName.toLowerCase(), slug };
    });
    setHeadings(extractedHeadings);
  }, [content]);

  if (headings.length < 2) return null;

  return (
    <nav className="bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 border border-blue-100 dark:border-gray-700 rounded-xl p-5 mb-8 shadow-sm" data-testid="article-toc">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between w-full text-left">
        <div className="flex items-center gap-2">
          <List className="text-french-blue" size={20} />
          <span className="font-semibold text-gray-900 dark:text-white">Sommaire de l'article</span>
        </div>
        <span className="text-french-blue text-sm">{isOpen ? 'Masquer' : 'Afficher'}</span>
      </button>
      {isOpen && (
        <ol className="mt-4 space-y-2 list-none pl-0">
          {headings.map((heading, index) => (
            <li key={heading.id} className={heading.level === 'h3' ? 'ml-4' : ''}>
              <a href={`#${heading.slug}`}
                onClick={(e) => {
                  e.preventDefault();
                  const articleContent = document.querySelector('.article-content');
                  if (articleContent) {
                    const allHeadings = articleContent.querySelectorAll('h2, h3');
                    if (allHeadings[index]) allHeadings[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className={`flex items-center gap-2 py-1.5 px-3 rounded-lg transition-all hover:bg-french-blue hover:text-white ${
                  heading.level === 'h2' ? 'text-gray-800 dark:text-gray-200 font-medium' : 'text-gray-600 dark:text-gray-400 text-sm'
                }`}
              >
                {heading.level === 'h2' && (
                  <span className="w-6 h-6 bg-french-blue text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {headings.filter((h, i) => h.level === 'h2' && i <= index).length}
                  </span>
                )}
                {heading.level === 'h3' && <span className="w-1.5 h-1.5 bg-french-blue rounded-full flex-shrink-0"></span>}
                <span className="line-clamp-1">{heading.text}</span>
              </a>
            </li>
          ))}
        </ol>
      )}
    </nav>
  );
};

const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [readingTime, setReadingTime] = useState(0);

  const decodeHtmlEntities = (text) => { const t = document.createElement('textarea'); t.innerHTML = text; return t.value; };

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); fetchArticle(); }, [slug]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/articles/${slug}`);
      const data = response.data;
      const contentHtml = data.content_html || '';
      setReadingTime(Math.ceil(contentHtml.replace(/<[^>]*>/g, '').split(/\s+/).length / 200));
      setArticle({
        title: decodeHtmlEntities(data.title), content: contentHtml, excerpt: data.excerpt || '',
        slug: data.slug, category: data.category || 'Conseils & Astuces',
        created_at: data.date_published, updated_at: data.date_modified || data.date_published,
        author_name: data.author || 'Pierrick', featured_image: data.image_url, yoast_seo: data.yoast_seo,
        canonical_url: data.canonical_url || null, video_url: data.video_url || null
      });
      setError(null);
    } catch (err) {
      setError(err.response?.status === 404 ? 'Article non trouvé.' : "Impossible de charger l'article.");
    } finally { setLoading(false); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const formatDateISO = (d) => new Date(d).toISOString();

  const generateSchemaOrg = () => {
    if (!article) return null;
    return JSON.stringify({
      "@context": "https://schema.org", "@type": "Article", "headline": article.title,
      "description": article.excerpt, "image": resolveImageUrl(article.featured_image),
      "author": { "@type": "Person", "name": "Pierrick", "url": `${SITE_URL}/a-propos` },
      "publisher": { "@type": "LocalBusiness", "name": "Aide Numérique 37",
        "logo": { "@type": "ImageObject", "url": `${SITE_URL}/logo.png` },
        "address": { "@type": "PostalAddress", "addressRegion": "Indre-et-Loire", "addressCountry": "FR" }, "telephone": "+33761503585" },
      "datePublished": formatDateISO(article.created_at), "dateModified": formatDateISO(article.updated_at),
      "mainEntityOfPage": { "@type": "WebPage", "@id": `${SITE_URL}/articles/${article.slug}` },
      "articleSection": article.category, "inLanguage": "fr-FR"
    });
  };

  const generateBreadcrumbSchema = () => {
    if (!article) return null;
    return JSON.stringify({
      "@context": "https://schema.org", "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Accueil", "item": SITE_URL },
        { "@type": "ListItem", "position": 2, "name": "Articles", "item": `${SITE_URL}/articles` },
        { "@type": "ListItem", "position": 3, "name": article.title, "item": `${SITE_URL}/articles/${article.slug}` }
      ]
    });
  };

  const dk = "dark:from-gray-950 dark:via-gray-900 dark:to-gray-950";

  if (loading) {
    return (
      <div className={`min-h-screen pt-24 pb-20 bg-gradient-to-br from-blue-50 via-white to-blue-50 ${dk} transition-colors`}>
        <div className="max-w-4xl mx-auto px-4"><div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-french-blue" size={48} /></div></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen pt-24 pb-20 bg-gradient-to-br from-blue-50 via-white to-blue-50 ${dk} transition-colors`}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-2xl shadow-lg dark:shadow-none p-8 text-center" data-testid="article-error">
            <AlertCircle className="text-red-500 mx-auto mb-4" size={64} />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{error}</h1>
            <Link to="/articles">
              <Button variant="outline" className="border-2 border-french-blue text-french-blue hover:bg-french-blue hover:text-white">
                <ArrowLeft className="mr-2" size={18} /> Retour aux articles
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-24 pb-20 bg-gradient-to-br from-blue-50 via-white to-blue-50 ${dk} transition-colors duration-300`}>
      <Helmet>
        <title>{article.yoast_seo?.title || `${article.title} | Aide Numérique 37`}</title>
        <meta name="description" content={article.yoast_seo?.description || article.excerpt} />
        <link rel="canonical" href={`${SITE_URL}/articles/${article.slug}`} />
        <meta name="robots" content={article.status === 'scheduled' ? "noindex, follow" : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={article.yoast_seo?.og_title || article.title} />
        <meta property="og:description" content={article.yoast_seo?.og_description || article.excerpt} />
        <meta property="og:image" content={resolveImageUrl(article.featured_image)} />
        <meta property="og:url" content={`${SITE_URL}/articles/${article.slug}`} />
        <meta property="og:site_name" content="Aide Numérique 37" />
        <meta property="og:locale" content="fr_FR" />
        <meta property="article:published_time" content={formatDateISO(article.created_at)} />
        <meta property="article:modified_time" content={formatDateISO(article.updated_at)} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.excerpt} />
        <meta name="twitter:image" content={resolveImageUrl(article.featured_image)} />
        <meta name="author" content="Pierrick - Aide Numérique 37" />
        <meta name="geo.region" content="FR-37" />
        <script type="application/ld+json">{generateSchemaOrg()}</script>
        <script type="application/ld+json">{generateBreadcrumbSchema()}</script>
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Fil d'Ariane" className="mb-6" data-testid="article-breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400" itemScope itemType="https://schema.org/BreadcrumbList">
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <Link to="/" className="hover:text-french-blue transition-colors" itemProp="item"><span itemProp="name">Accueil</span></Link>
              <meta itemProp="position" content="1" />
            </li>
            <ChevronRight size={14} />
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <Link to="/articles" className="hover:text-french-blue transition-colors" itemProp="item"><span itemProp="name">Articles</span></Link>
              <meta itemProp="position" content="2" />
            </li>
            <ChevronRight size={14} />
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem" className="text-french-blue font-medium truncate max-w-[200px]">
              <span itemProp="name">{article.title}</span><meta itemProp="position" content="3" />
            </li>
          </ol>
        </nav>

        {/* Main Article */}
        <article itemScope itemType="https://schema.org/Article" className="bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-2xl shadow-lg dark:shadow-none overflow-hidden" data-testid="article-detail">
          <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
            <img src={resolveImageUrl(article.featured_image)} alt={article.title} className="w-full h-full object-cover" itemProp="image" loading="lazy"
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200&h=600&fit=crop'; }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            <div className="absolute top-4 left-4">
              <span className="bg-french-blue text-white text-xs font-semibold px-3 py-1 rounded-full" data-testid="article-category-badge">{article.category}</span>
            </div>
          </div>

          <header className="p-6 md:p-10 pb-0">
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
              <div className="flex items-center gap-2"><Calendar size={16} className="text-french-blue" />
                <time dateTime={article.created_at} itemProp="datePublished" content={formatDateISO(article.created_at)}>{formatDate(article.created_at)}</time>
              </div>
              <div className="flex items-center gap-2"><Clock size={16} className="text-french-blue" /><span>{readingTime} min de lecture</span></div>
              <div className="flex items-center gap-2"><User size={16} className="text-french-blue" />
                <span itemProp="author" itemScope itemType="https://schema.org/Person"><span itemProp="name">{article.author_name}</span></span>
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight mb-4" itemProp="headline">{article.title}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed border-l-4 border-french-blue pl-4 mb-6" itemProp="description">{article.excerpt}</p>
          </header>

          <div className="p-6 md:p-10 pt-4">
            <TableOfContents content={article.content} />
            <div className="article-content dark:text-gray-300 dark:[&_h2]:text-white dark:[&_h3]:text-gray-100 dark:[&_a]:text-french-blue dark:[&_strong]:text-white dark:[&_blockquote]:border-french-blue dark:[&_blockquote]:bg-gray-800/50 dark:[&_code]:bg-gray-800 dark:[&_code]:text-french-blue dark:[&_pre]:bg-gray-800 dark:[&_li]:text-gray-300 [&_img]:loading-lazy" itemProp="articleBody" dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content).replace(/<img /g, '<img loading="lazy" decoding="async" ') }} />

            {/* Video section — only when a video is attached */}
            {article.video_url && (
              <div className="mt-10 rounded-2xl border border-blue-100 dark:border-gray-700 bg-blue-50 dark:bg-gray-800/50 overflow-hidden" data-testid="article-video-section">
                <div className="px-6 pt-6 pb-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-french-blue rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                  <p className="font-semibold text-gray-800 dark:text-white text-base">
                    Le résumé de votre article en vidéo en 1 minute par mon clone IA
                  </p>
                </div>
                <div className="px-6 pb-6">
                  <video
                    src={article.video_url.startsWith('/api') ? `${BACKEND_URL}${article.video_url}` : article.video_url}
                    controls
                    controlsList="nodownload"
                    poster={resolveImageUrl(article.featured_image) || undefined}
                    className="w-full rounded-xl shadow-md"
                    preload="metadata"
                    data-testid="article-video-player"
                  >
                    <p className="text-sm text-gray-500">Votre navigateur ne supporte pas la lecture vidéo.</p>
                  </video>
                </div>
              </div>
            )}
          </div>

          <footer className="p-6 md:p-10 pt-0">
            <div className="flex flex-wrap gap-2 mb-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Th&egrave;mes :</span>
              <span className="bg-blue-50 dark:bg-french-blue/10 text-french-blue text-xs font-medium px-3 py-1 rounded-full">{article.category}</span>
              <span className="bg-blue-50 dark:bg-french-blue/10 text-french-blue text-xs font-medium px-3 py-1 rounded-full">Aide num&eacute;rique</span>
              <span className="bg-blue-50 dark:bg-french-blue/10 text-french-blue text-xs font-medium px-3 py-1 rounded-full">Indre-et-Loire</span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <span>Mis &agrave; jour le </span>
                <time dateTime={article.updated_at} itemProp="dateModified" content={formatDateISO(article.updated_at)}>{formatDate(article.updated_at)}</time>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">Partager :</span>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${SITE_URL}/articles/${article.slug}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors" aria-label="Facebook">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/></svg>
                </a>
                <a href={`https://wa.me/?text=${encodeURIComponent(article.title + ' - ' + SITE_URL + '/articles/' + article.slug)}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors" aria-label="WhatsApp">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </a>
                <a href={`mailto:?subject=${encodeURIComponent(article.title)}&body=${encodeURIComponent('Je vous recommande cet article : ' + SITE_URL + '/articles/' + article.slug)}`} className="w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors" aria-label="Email">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </a>
              </div>
            </div>

            <div className="pt-4">
              <Link to="/articles">
                <Button variant="outline" className="border-2 border-french-blue text-french-blue hover:bg-french-blue hover:text-white" data-testid="article-back-btn">
                  <ArrowLeft className="mr-2" size={18} /> Voir tous les articles
                </Button>
              </Link>
            </div>
          </footer>
        </article>

        {/* Author Box */}
        <div className="mt-8 bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-2xl shadow-lg dark:shadow-none p-6 md:p-8" data-testid="article-author-box">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-20 h-20 bg-french-blue rounded-full flex items-center justify-center flex-shrink-0">
              <User className="text-white" size={40} />
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">&Agrave; propos de l'auteur</h2>
              <p className="text-lg font-semibold text-french-blue mb-2">Pierrick - Aide Num&eacute;rique 37</p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                M&eacute;diateur num&eacute;rique certifi&eacute;, j'accompagne les particuliers et seniors dans leur quotidien num&eacute;rique en Indre-et-Loire (37). Passionn&eacute; par la transmission, je simplifie la technologie pour la rendre accessible &agrave; tous.
              </p>
              <Link to="/a-propos" className="text-french-blue font-medium hover:underline">En savoir plus &rarr;</Link>
            </div>
          </div>
        </div>

        {/* CTA - same orange/red style as homepage */}
        <div className="mt-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg dark:shadow-none border border-gray-100 dark:border-gray-800 p-8 text-center" data-testid="article-cta">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Besoin d'aide avec votre informatique ?</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-xl mx-auto">
            Je me d&eacute;place &agrave; votre domicile en Indre-et-Loire pour vous accompagner. B&eacute;n&eacute;ficiez de 50% de cr&eacute;dit d'imp&ocirc;t.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => { navigate('/'); setTimeout(() => { document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }, 100); }}
              className="inline-flex items-center gap-2 bg-french-red hover:bg-french-red/90 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 group"
              data-testid="article-cta-contact"
            >
              <Phone size={20} className="group-hover:rotate-12 transition-transform" />
              Me Contacter
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <a href="tel:0761503585" className="inline-flex items-center gap-2 border-2 border-french-blue text-french-blue dark:text-french-blue px-6 py-3 rounded-lg font-semibold hover:bg-french-blue hover:text-white transition-colors">
              <Phone size={18} /> 07 61 50 35 85
            </a>
          </div>
        </div>

        {/* Articles similaires — maillage interne SEO */}
        <div className="mt-2">
          <RelatedArticles currentSlug={article.slug} category={article.category} limit={3} />
        </div>

        {/* Internal SEO Links */}
        <div className="mt-8 bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-2xl shadow-lg dark:shadow-none p-6 md:p-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Continuer sur le site</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            <Link to="/" className="flex items-center gap-2 text-french-blue hover:underline font-medium text-sm py-1">
              <ChevronRight size={14} /> Accueil
            </Link>
            <Link to="/articles" className="flex items-center gap-2 text-french-blue hover:underline font-medium text-sm py-1">
              <ChevronRight size={14} /> Tous les articles
            </Link>
            <Link to="/a-propos" className="flex items-center gap-2 text-french-blue hover:underline font-medium text-sm py-1">
              <ChevronRight size={14} /> A propos
            </Link>
            <Link to="/services/assistance-informatique" className="flex items-center gap-2 text-french-blue hover:underline font-medium text-sm py-1">
              <ChevronRight size={14} /> Assistance Informatique
            </Link>
            <Link to="/intervention/joue-les-tours" className="flex items-center gap-2 text-french-blue hover:underline font-medium text-sm py-1">
              <ChevronRight size={14} /> Joue-les-Tours
            </Link>
            <Link to="/mentions-legales" className="flex items-center gap-2 text-french-blue hover:underline font-medium text-sm py-1">
              <ChevronRight size={14} /> Mentions legales
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
