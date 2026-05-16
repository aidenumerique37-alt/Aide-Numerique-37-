import React, { useState } from 'react';
import { ExternalLink, Newspaper, ChevronDown, ChevronUp } from 'lucide-react';

const ARTICLE_FULL_TEXT = `Pierrick Le Penru, 29 ans, a décidé de franchir le pas. Après son BTS management, il a travaillé une dizaine d'années dans de grandes enseignes multimédias et chez divers opérateurs téléphoniques. Il a remarqué que bon nombre d'utilisateurs se retrouvaient perdus après un achat de matériel.

« J'ai pu constater au fil des années que de nombreuses personnes, notamment les seniors, avaient du mal à utiliser leurs équipements numériques au quotidien. L'idée de créer Aide Numérique 37 est née de ce constat », explique Pierrick.

Basé à Joué-lès-Tours, il intervient dans un rayon de 20 km autour de sa commune. Il propose de l'assistance informatique à domicile : dépannage, formation, installation et configuration de matériel informatique. Son entreprise est agréée Service à la Personne, ce qui permet à ses clients de bénéficier de 50% de crédit d'impôt sur les prestations.

« Mon objectif est d'apporter une aide personnalisée, avec patience et pédagogie. Je m'adapte au rythme de chacun pour que mes clients deviennent autonomes avec leurs outils numériques », poursuit-il.

Aide Numérique 37 s'adresse à tous les publics : seniors souhaitant apprendre à utiliser une tablette ou un smartphone, familles ayant besoin d'installer un réseau Wi-Fi, professionnels nécessitant une assistance technique. Pierrick propose également la création de sites web assistée par intelligence artificielle.`;

const Press = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="py-16 bg-white dark:bg-gray-950 transition-colors duration-300" data-testid="press-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            On Parle de Moi
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Aide Numérique 37 dans la presse locale
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-900/50 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="grid md:grid-cols-5 gap-0">
              {/* Image */}
              <div className="md:col-span-2 relative overflow-hidden">
                <img
                  src="https://images.lanouvellerepublique.fr/image/upload/t_1020w/f_auto/6915f90a6a8fba38418b4576.jpg"
                  alt="Pierrick Le Penru - Aide Numérique 37 - La Nouvelle République"
                  className="w-full h-full object-cover min-h-[200px] md:min-h-[280px]"
                  data-testid="press-article-image"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-gray-900 dark:text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                    <Newspaper size={14} className="text-french-blue" />
                    La Nouvelle République
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="md:col-span-3 p-6 md:p-8 flex flex-col justify-center">
                <div className="text-sm text-french-blue font-semibold mb-2 uppercase tracking-wide">
                  Presse locale - Indre-et-Loire
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3 leading-tight">
                  Joué-lès-Tours : Pierrick Le Penru vient de lancer son entreprise Aide Numérique 37
                </h3>
                <div className="text-gray-600 dark:text-gray-400 leading-relaxed" data-testid="press-article-text">
                  {expanded ? (
                    <div className="space-y-3">
                      {ARTICLE_FULL_TEXT.split('\n\n').map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                    </div>
                  ) : (
                    <p>
                      Pierrick Le Penru, 29 ans, a décidé de franchir le pas. Après son BTS management, il a travaillé une dizaine d'années dans de grandes enseignes multimédias et chez divers opérateurs téléphoniques. Il a remarqué que bon nombre d'utilisateurs se retrouvaient perdus après un achat de matériel...
                    </p>
                  )}
                </div>
                <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="flex items-center gap-2 text-french-blue font-semibold hover:text-french-blue/80 transition-colors"
                    data-testid="press-toggle-expand"
                  >
                    <span>{expanded ? 'Réduire' : 'Afficher plus'}</span>
                    {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <a
                    href="https://www.lanouvellerepublique.fr/indre-et-loire/commune/joue-les-tours/joue-les-tours-pierrick-le-penru-vient-de-lancer-son-entreprise-aide-numerique-37-1763047692"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-french-blue font-medium transition-colors text-sm"
                    data-testid="press-article-link"
                  >
                    <span>Lire l'article complet sur le site de la Nouvelle République</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Press;
