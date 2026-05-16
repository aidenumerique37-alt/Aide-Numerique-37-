import React from 'react';
import { useFadeInOnScroll } from '../hooks/useFadeInOnScroll';

const FadeInSection = ({ children, className = '', delay = 0 }) => {
  const { ref, isVisible } = useFadeInOnScroll();
  const delayClass = delay > 0 ? `delay-${delay}` : '';

  return (
    <div
      ref={ref}
      className={`fade-in-section ${isVisible ? 'is-visible' : ''} ${delayClass} ${className}`}
    >
      {children}
    </div>
  );
};

export default FadeInSection;
