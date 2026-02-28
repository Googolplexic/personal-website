import { useState, useEffect, type ComponentType } from 'react';

/**
 * Loads and mounts Vercel Analytics and Speed Insights only after the main thread
 * is idle. Uses dynamic import() so their SDK code is NOT in the initial bundle —
 * the chunk is requested and executed only after idle, keeping TBT low.
 */
export function DeferredAnalytics() {
  const [Widgets, setWidgets] = useState<ComponentType | null>(null);

  useEffect(() => {
    const load = () => {
      if ('requestIdleCallback' in window) {
        (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => void })
          .requestIdleCallback(
            () => {
              Promise.all([
                import('@vercel/analytics/react'),
                import('@vercel/speed-insights/react'),
              ]).then(([analytics, speedInsights]) => {
                setWidgets(() => function VercelWidgets() {
                  return (
                    <>
                      <analytics.Analytics />
                      <speedInsights.SpeedInsights />
                    </>
                  );
                });
              });
            },
            { timeout: 2500 }
          );
      } else {
        const t = setTimeout(() => {
          Promise.all([
            import('@vercel/analytics/react'),
            import('@vercel/speed-insights/react'),
          ]).then(([analytics, speedInsights]) => {
            setWidgets(() => function VercelWidgets() {
              return (
                <>
                  <analytics.Analytics />
                  <speedInsights.SpeedInsights />
                </>
              );
            });
          });
        }, 1200);
        return () => clearTimeout(t);
      }
    };
    if (document.readyState === 'complete') {
      load();
    } else {
      window.addEventListener('load', load, { once: true });
    }
  }, []);

  if (!Widgets) return null;
  return <Widgets />;
}
