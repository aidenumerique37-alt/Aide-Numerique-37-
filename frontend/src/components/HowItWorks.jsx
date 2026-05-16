import React, { useEffect, useRef, useState } from 'react';
import { Phone, ArrowRight, MessageSquare, CalendarCheck, Car, Wrench, FileText, CreditCard } from 'lucide-react';
import { Button } from './ui/button';

const steps = [
  { num: 1, icon: MessageSquare, title: "Vous me contactez", desc: "Je fais le point avec vous sur vos besoins par telephone ou via le formulaire de contact.", color: "from-french-blue to-sky-blue", accent: "border-french-blue" },
  { num: 2, icon: CalendarCheck, title: "Je me rends disponible rapidement", desc: "Je vous propose un creneau d'intervention au plus vite, selon vos disponibilites.", color: "from-sky-blue to-cyan-500", accent: "border-sky-blue" },
  { num: 3, icon: Car, title: "Je me deplace a votre domicile", desc: "J'interviens directement chez vous, partout en Indre-et-Loire. Aucun deplacement de votre part.", color: "from-cyan-500 to-teal-500", accent: "border-cyan-500" },
  { num: 4, icon: Wrench, title: "Je realise la prestation prevue", desc: "Depannage, formation, installation ou configuration : je resous votre probleme avec patience et pedagogie.", color: "from-teal-500 to-emerald-500", accent: "border-teal-500" },
  { num: 5, icon: FileText, title: "Un support recapitulatif si besoin", desc: "Si necessaire, je vous laisse un document recapitulatif des manipulations effectuees pour votre autonomie.", color: "from-emerald-500 to-green-500", accent: "border-emerald-500" },
  { num: 6, icon: CreditCard, title: "50% de crédit d'impôt", desc: "Ne payez que la part restant grâce à l'avance immédiate de crédit d'impôt, soit 25€ de l'heure.", color: "from-green-500 to-french-blue", accent: "border-green-500" },
];

const StepCard = ({ step, index }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const Icon = step.icon;
  const isLeft = index % 2 === 0;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.3, rootMargin: '0px 0px -30px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`md:flex items-center ${isLeft ? '' : 'md:flex-row-reverse'} md:gap-8 relative`}>
      <div className={`md:w-[calc(50%-2rem)] ${isLeft ? 'md:text-right' : 'md:text-left'}`}>
        <div
          className={`bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl p-5 shadow-sm border-l-4 ${step.accent} dark:border-opacity-80 hover:shadow-lg group
            transition-all duration-700 ease-out
            ${isVisible
              ? 'opacity-100 translate-y-0 translate-x-0 scale-100'
              : isLeft
                ? 'opacity-0 -translate-x-12 scale-95'
                : 'opacity-0 translate-x-12 scale-95'
            }
          `}
          data-testid={`step-${step.num}`}
        >
          <div className={`flex items-center gap-3 mb-2 ${isLeft ? 'md:justify-end' : 'md:justify-start'}`}>
            <span className="text-xs font-bold text-french-blue bg-french-blue/10 px-2 py-0.5 rounded-full flex-shrink-0 order-first">
              Étape {step.num}
            </span>
            <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-french-blue transition-colors">
              {step.title}
            </h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{step.desc}</p>
        </div>
      </div>

      <div className="hidden md:flex w-16 h-16 flex-shrink-0 items-center justify-center relative">
        <div
          className={`w-12 h-12 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg transition-all duration-700
            ${isVisible ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 rotate-90'}
          `}
        >
          <Icon size={20} className="text-white" />
        </div>
      </div>

      <div className="md:hidden flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shadow flex-shrink-0 transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
          <Icon size={16} className="text-white" />
        </div>
      </div>

      <div className="hidden md:block md:w-[calc(50%-2rem)]" />
    </div>
  );
};

const HowItWorks = () => {
  const titleRef = useRef(null);
  const [titleVisible, setTitleVisible] = useState(false);

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setTitleVisible(entry.isIntersecting),
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="py-16 bg-gray-50 dark:bg-gray-900/50 transition-colors duration-300 relative overflow-hidden"
      data-testid="how-it-works"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div
          ref={titleRef}
          className={`text-center mb-12 transition-all duration-700 ${titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Comment se passe un rendez-vous avec Pierrick ?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            De votre premier appel à la résolution de votre problème, voici les étapes d'une intervention à domicile « réussie ».
          </p>
        </div>

        <div className="relative">
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 z-0 bg-gradient-to-b from-french-blue/20 via-teal-500/20 to-green-500/20" />
          <div className="space-y-6 md:space-y-0 relative z-10">
            {steps.map((step, i) => (
              <StepCard key={i} step={step} index={i} />
            ))}
          </div>
        </div>

        <div className="mt-12 bg-gradient-to-r from-french-blue to-sky-blue rounded-2xl overflow-hidden shadow-xl">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="p-8 md:p-10 flex flex-col justify-center text-white">
              <h3 className="text-2xl font-bold mb-3">Des clients satisfaits a chaque intervention</h3>
              <p className="text-blue-100 mb-6 leading-relaxed">
                Comme des centaines de clients en Indre-et-Loire, faites confiance à Aide Numérique 37 pour une assistance informatique à domicile professionnelle, humaine et accessible.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href="/#contact">
                  <Button className="bg-french-red hover:bg-french-red/90 text-white shadow-lg" data-testid="howto-cta">
                    <Phone className="mr-2" size={18} /> Me Contacter <ArrowRight className="ml-2" size={18} />
                  </Button>
                </a>
                <a href="tel:0761503585">
                  <Button variant="outline" className="border-white text-white hover:bg-white/10">07 61 50 35 85</Button>
                </a>
              </div>
            </div>
            <div className="relative min-h-[250px]">
              <img src="https://images.unsplash.com/photo-1758686254493-7b3e49a8f325?w=600&h=400&fit=crop" alt="Couple de seniors heureux utilisant un ordinateur" className="w-full h-full object-cover" loading="lazy" data-testid="howto-seniors-image" />
            </div>
          </div>
        </div>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org", "@type": "HowTo",
          "name": "Comment se passe un rendez-vous avec Aide Numérique 37 ?",
          "description": "Les étapes d'une intervention d'assistance informatique à domicile avec Aide Numérique 37 en Indre-et-Loire.",
          "step": steps.map((s, i) => ({ "@type": "HowToStep", "position": i + 1, "name": s.title, "text": s.desc })),
          "totalTime": "PT2H",
          "tool": [{ "@type": "HowToTool", "name": "Telephone" }, { "@type": "HowToTool", "name": "Materiel informatique" }]
        })
      }} />
    </section>
  );
};

export default HowItWorks;
