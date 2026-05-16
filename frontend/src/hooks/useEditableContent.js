import { useState, useEffect } from 'react';

// Default content for all editable sections
const defaultContent = {
  hero: {
    title: "Votre Médiateur",
    titleHighlight: "Numérique",
    titleSuffix: "à Domicile",
    subtitle: "Accompagnement personnalisé en informatique et numérique à votre domicile en Indre-et-Loire.",
    buttonText: "Me Contacter"
  },
  services: {
    title: "Mes Services d'Assistance Informatique",
    subtitle: "Un accompagnement personnalisé pour tous vos besoins informatiques et numériques à domicile"
  },
  about: {
    title: "À Propos de Moi",
    description: "Passionné par le numérique et l'accompagnement des personnes, je mets mes compétences à votre service."
  },
  contact: {
    title: "Contactez-Moi",
    subtitle: "Une question ? Besoin d'un devis ? N'hésitez pas à me contacter !"
  }
};

export const useEditableContent = () => {
  const [content, setContent] = useState(defaultContent);

  useEffect(() => {
    // Load from localStorage if available
    const savedContent = localStorage.getItem('siteContent');
    if (savedContent) {
      try {
        const parsed = JSON.parse(savedContent);
        // Merge with defaults to ensure all fields exist
        setContent({
          hero: { ...defaultContent.hero, ...parsed.hero },
          services: { ...defaultContent.services, ...parsed.services },
          about: { ...defaultContent.about, ...parsed.about },
          contact: { ...defaultContent.contact, ...parsed.contact }
        });
      } catch (e) {
        console.error('Error parsing saved content:', e);
      }
    }

    // Listen for storage changes (from admin panel)
    const handleStorageChange = (e) => {
      if (e.key === 'siteContent' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setContent({
            hero: { ...defaultContent.hero, ...parsed.hero },
            services: { ...defaultContent.services, ...parsed.services },
            about: { ...defaultContent.about, ...parsed.about },
            contact: { ...defaultContent.contact, ...parsed.contact }
          });
        } catch (err) {
          console.error('Error parsing updated content:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return content;
};

export default useEditableContent;
