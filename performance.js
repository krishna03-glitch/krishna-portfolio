(() => {
  const mathRoots = ['bg-formulas', 'maths', 'pde-ml', 'graph-theory']
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if (!mathRoots.length) return;

  let loading;
  const delimiters = [
    { left: '$$', right: '$$', display: true },
    { left: '$', right: '$', display: false },
    { left: '\\(', right: '\\)', display: false },
    { left: '\\[', right: '\\]', display: true },
  ];

  const loadMath = () => {
    if (loading) return loading;
    loading = new Promise((resolve, reject) => {
      const stylesheet = document.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css';
      document.head.append(stylesheet);

      const katex = document.createElement('script');
      katex.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js';
      katex.async = true;
      katex.onload = () => {
        const render = document.createElement('script');
        render.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js';
        render.async = true;
        render.onload = () => {
          const run = () => {
            mathRoots.forEach((root) => window.renderMathInElement(root, { delimiters }));
            resolve();
          };
          if ('requestIdleCallback' in window) requestIdleCallback(run, { timeout: 1200 });
          else setTimeout(run, 80);
        };
        render.onerror = reject;
        document.head.append(render);
      };
      katex.onerror = reject;
      document.head.append(katex);
    });
    return loading;
  };

  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    observer.disconnect();
    const kick = () => loadMath().catch(() => {});
    if ('requestIdleCallback' in window) requestIdleCallback(kick, { timeout: 1500 });
    else setTimeout(kick, 120);
  }, { rootMargin: '350px 0px' });

  mathRoots.forEach((root) => observer.observe(root));
})();
