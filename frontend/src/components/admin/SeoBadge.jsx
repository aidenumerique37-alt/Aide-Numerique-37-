import React from 'react';

export const computeSeoScore = (article) => {
  const checks = [];

  const metaTitle = article.meta_title || article.title || '';
  const titleLen = metaTitle.length;
  checks.push({
    label: 'Titre SEO',
    status: titleLen >= 50 && titleLen <= 60 ? 'green' : titleLen >= 40 && titleLen <= 70 ? 'orange' : 'red',
    detail: `${titleLen} car.`
  });

  const metaDesc = article.meta_description || article.excerpt || '';
  const descLen = metaDesc.length;
  checks.push({
    label: 'Meta desc.',
    status: descLen >= 140 && descLen <= 160 ? 'green' : descLen >= 120 && descLen <= 175 ? 'orange' : 'red',
    detail: `${descLen} car.`
  });

  // Use stored word_count if available (populated at generation/save time)
  let wordCount;
  if (typeof article.word_count === 'number' && article.word_count > 0) {
    wordCount = article.word_count;
  } else {
    const html = article.content_html || '';
    wordCount = html
      .replace(/&nbsp;/g, ' ')
      .replace(/<[^>]*>/g, ' ')
      .split(/\s+/)
      .filter(Boolean).length;
  }
  checks.push({
    label: 'Mots',
    status: wordCount >= 700 ? 'green' : wordCount >= 400 ? 'orange' : 'red',
    detail: wordCount > 0 ? `~${wordCount}` : '—'
  });

  const hasImage = !!(article.image_url || article.featured_image);
  checks.push({ label: 'Image', status: hasImage ? 'green' : 'red', detail: hasImage ? 'OK' : 'Absente' });

  // Allow underscores in slugs (Python normalizer may keep them)
  const slug = article.slug || '';
  checks.push({
    label: 'Slug',
    status: slug.length > 0 && slug.length <= 60 && /^[a-z0-9_-]+$/.test(slug) ? 'green' : 'orange',
    detail: slug ? `/${slug.slice(0, 30)}` : '—'
  });

  const greens = checks.filter(c => c.status === 'green').length;
  const overall = greens >= 4 ? 'green' : greens >= 2 ? 'orange' : 'red';
  return { overall, checks, score: greens, total: checks.length };
};

export const SeoBadge = ({ article }) => {
  const [showTooltip, setShowTooltip] = React.useState(false);
  if (!article) return null;
  const seo = computeSeoScore(article);
  const c = {
    green: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500', label: 'Bon' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-400', label: 'Moyen' },
    red: { bg: 'bg-red-100', text: 'text-red-600', dot: 'bg-red-500', label: 'Faible' }
  }[seo.overall];

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${c.bg} ${c.text} cursor-help select-none`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${c.dot} flex-shrink-0`} />
        SEO {seo.score}/{seo.total}
      </button>
      {showTooltip && (
        <div className="absolute left-0 bottom-full mb-1.5 z-50 bg-white rounded-xl shadow-2xl border border-gray-100 p-3 w-52 text-xs pointer-events-none">
          <p className="font-bold text-gray-800 mb-2">SEO : {c.label} ({seo.score}/{seo.total})</p>
          {seo.checks.map((ch, i) => (
            <div key={i} className="flex items-center justify-between py-0.5 gap-1">
              <span className="text-gray-500 truncate">{ch.label}</span>
              <span className={`font-semibold truncate ${ch.status === 'green' ? 'text-green-600' : ch.status === 'orange' ? 'text-orange-500' : 'text-red-500'}`}>
                {ch.detail}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const PlanningDataBadge = ({ item }) => {
  const fields = ['main_keyword', 'meta_title', 'meta_description', 'h2_1', 'h2_2', 'faq_q1', 'cta_main', 'img_main_alt'];
  const filled = fields.filter(f => item[f] && String(item[f]).trim()).length;
  const c = filled >= 6
    ? 'bg-green-100 text-green-700'
    : filled >= 3
    ? 'bg-orange-100 text-orange-700'
    : 'bg-red-100 text-red-600';
  return (
    <span
      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${c}`}
      title={`${filled}/8 colonnes renseignées`}
    >
      {filled}/8
    </span>
  );
};
