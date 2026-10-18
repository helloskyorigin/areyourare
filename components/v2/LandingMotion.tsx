'use client';
import { useEffect, useRef } from 'react';

/** Viewport entrance accents with no dependency on animation libraries. */
export function LandingMotion() {
  const progressRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const targets = document.querySelectorAll<HTMLElement>(
      '.intro-section h2, .intro-section p, .showcase, .section-heading, .feature-card, .how-wrap > div:first-child, .how-steps > div, .book-stage, .capsule-promo-text, .faq > div, .last-word h2'
    );
    const observer = 'IntersectionObserver' in window
      ? new IntersectionObserver(entries => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add('motion-in');
              observer.unobserve(entry.target);
            }
          }
        }, { threshold: 0.07, rootMargin: '0px 0px -25px 0px' })
      : null;
    targets.forEach(target => observer?.observe(target));
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (progressRef.current) progressRef.current.style.transform = 'scaleX(' + ratio + ')';
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      observer?.disconnect();
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);
  return <div className="landing-progress" aria-hidden="true" ref={progressRef}/>;
}
