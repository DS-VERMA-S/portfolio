const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('is-pending');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.project-card, .timeline-item, .education-grid > div').forEach(item => {
    item.classList.add('reveal', 'is-pending');
    observer.observe(item);
  });
}
if (document.modelContext?.registerTool) {
  const lifecycle = new AbortController();
  try {
    Promise.resolve(document.modelContext.registerTool({
      name: 'navigate_portfolio',
      description: 'Navigate to a section of Sachin Verma’s portfolio.',
      inputSchema: { type: 'object', properties: { section: { type: 'string', enum: ['top', 'work', 'about', 'experience', 'contact'] } }, required: ['section'], additionalProperties: false },
      annotations: { readOnlyHint: false },
      execute: ({ section }) => {
        if (!['top', 'work', 'about', 'experience', 'contact'].includes(section)) throw new Error('Unknown section');
        const target = document.getElementById(section);
        target.scrollIntoView({ behavior: 'instant' });
        history.replaceState(null, '', '#' + section);
        return { section };
      }
    }, { signal: lifecycle.signal })).catch(() => {});
  } catch {}
  window.addEventListener('pagehide', event => { if (!event.persisted) lifecycle.abort(); });
}
