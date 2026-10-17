'use client';

import React, { useEffect, useState } from 'react';

interface RarityCountUpProps {
  target: number;
}

export function RarityCountUp({ target }: RarityCountUpProps) {
  const [displayValue, setDisplayValue] = useState('0.00');

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      const frame = requestAnimationFrame(() => {
        setDisplayValue(target.toFixed(2));
      });
      return () => cancelAnimationFrame(frame);
    }

    let startTime: number | null = null;
    const duration = 1600; // 1.6s smooth easing count-up

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth ease-out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const current = easedProgress * target;

      setDisplayValue(current.toFixed(2));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(target.toFixed(2));
      }
    };

    const frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [target]);

  return <span>{displayValue}%</span>;
}
