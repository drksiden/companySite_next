'use client'

import { useEffect } from 'react';

export default function ErrorPage() {
  useEffect(() => {
    // Добавляем мета-тег noindex для предотвращения индексации страниц ошибок
    const metaRobots = document.querySelector('meta[name="robots"]');
    if (metaRobots) {
      metaRobots.setAttribute('content', 'noindex, nofollow');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'robots';
      meta.content = 'noindex, nofollow';
      document.head.appendChild(meta);
    }
  }, []);

  return <p>Sorry, something went wrong</p>
}