import { useState, useEffect, type ComponentType } from 'react';

/**
 * Loads and mounts Vercel Analytics and Speed Insights only after the main thread
 * is idle. Uses dynamic import() so their SDK code is NOT in the initial bundle —
 * the chunk is requested and executed only after idle, keeping TBT low.
 */
export function DeferredAnalytics() {
  const [Widgets, setWidgets] = useState<ComponentType | null>(null);

  useEffect(() => {
    let cancelled = false;
    let idleId: number | undefined;
    let timer: number | undefined;

    const mount = () => {
      void Promise.all([
        import('@vercel/analytics/react'),
        import('@vercel/speed-insights/react'),
      ]).then(([analytics, speedInsights]) => {
        if (cancelled) return;
        setWidgets(() => function VercelWidgets() {
          return (
            <>
              <analytics.Analytics />
              <speedInsights.SpeedInsights />
            </>
          );
        });
      });
    };
    // Safari has no requestIdleCallback
    const schedule = () => {
      if (typeof window.requestIdleCallback === 'function') idleId = window.requestIdleCallback(mount, { timeout: 2500 });
      else timer = window.setTimeout(mount, 1200);
    };

    if (document.readyState === 'complete') schedule();
    else window.addEventListener('load', schedule, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener('load', schedule);
      if (idleId !== undefined) window.cancelIdleCallback(idleId);
      clearTimeout(timer);
    };
  }, []);

  if (!Widgets) return null;
  return <Widgets />;
}
