import { useEffect, useRef } from 'react';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    opacityTarget: number;
    opacitySpeed: number;
    color: string;
}

const COLORS = [
    'rgba(255, 248, 230,',  // warm white
    'rgba(201, 168, 76,',   // gold
    'rgba(255, 240, 200,',  // pale gold
    'rgba(230, 220, 180,',  // warm cream
];

function makeParticle(w: number, h: number): Particle {
    const opacity = Math.random() * 0.28 + 0.04;
    return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18,
        vy: Math.random() * 0.22 + 0.06, // drift downward
        size: Math.random() * 1.4 + 0.3,
        opacity,
        opacityTarget: opacity,
        opacitySpeed: Math.random() * 0.003 + 0.001,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
}

export function HeroParticles({ count = 110 }: { count?: number }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: -9999, y: -9999 });
    const pointerClientRef = useRef({ x: -9999, y: -9999, active: false });
    const particlesRef = useRef<Particle[]>([]);
    const rafRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            const rect = canvas.parentElement!.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
            // Re-seed only if empty
            if (particlesRef.current.length === 0) {
                particlesRef.current = Array.from({ length: count }, () =>
                    makeParticle(canvas.width, canvas.height)
                );
            }
        };

        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(canvas.parentElement!);

        const syncPointerToCanvas = () => {
            const { x, y, active } = pointerClientRef.current;
            if (!active) {
                mouseRef.current = { x: -9999, y: -9999 };
                return;
            }

            const rect = canvas.getBoundingClientRect();
            const isInside =
                x >= rect.left &&
                x <= rect.right &&
                y >= rect.top &&
                y <= rect.bottom;

            mouseRef.current = isInside
                ? { x: x - rect.left, y: y - rect.top }
                : { x: -9999, y: -9999 };
        };

        const onMouseMove = (e: MouseEvent) => {
            pointerClientRef.current = { x: e.clientX, y: e.clientY, active: true };
            syncPointerToCanvas();
        };
        const onMouseLeaveWindow = () => {
            pointerClientRef.current.active = false;
            mouseRef.current = { x: -9999, y: -9999 };
        };
        const onViewportChange = () => {
            syncPointerToCanvas();
        };

        const onTouchMove = (e: TouchEvent) => {
            const rect = canvas.getBoundingClientRect();
            const t = e.touches[0];
            mouseRef.current = { x: t.clientX - rect.left, y: t.clientY - rect.top };
        };
        let touchClearId: ReturnType<typeof setTimeout>;
        const onTouchEnd = () => {
            clearTimeout(touchClearId);
            touchClearId = setTimeout(() => {
                mouseRef.current = { x: -9999, y: -9999 };
            }, 400);
        };

        const parent = canvas.parentElement!;
        window.addEventListener('mousemove', onMouseMove, { passive: true });
        window.addEventListener('mouseleave', onMouseLeaveWindow);
        window.addEventListener('scroll', onViewportChange, { passive: true });
        window.addEventListener('resize', onViewportChange, { passive: true });
        parent.addEventListener('touchmove', onTouchMove, { passive: true });
        parent.addEventListener('touchend', onTouchEnd, { passive: true });

        const draw = () => {
            const w = canvas.width;
            const h = canvas.height;
            ctx.clearRect(0, 0, w, h);

            const mx = mouseRef.current.x;
            const my = mouseRef.current.y;

            for (const p of particlesRef.current) {
                // Subtle mouse repulsion
                const dx = p.x - mx;
                const dy = p.y - my;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120 && dist > 0) {
                    const force = (120 - dist) / 120 * 0.035;
                    p.vx += (dx / dist) * force;
                    p.vy += (dy / dist) * force;
                }

                // Dampen velocity drift back to normal
                p.vx *= 0.98;
                p.vy = p.vy * 0.98 + (Math.random() * 0.22 + 0.06) * 0.02;

                p.x += p.vx;
                p.y += p.vy;

                // Opacity breathing
                p.opacity += (p.opacityTarget - p.opacity) * p.opacitySpeed * 60;
                if (Math.abs(p.opacity - p.opacityTarget) < 0.005) {
                    p.opacityTarget = Math.random() * 0.28 + 0.04;
                }

                // Wrap — respawn at top when leaving bottom
                if (p.y > h + 4) { p.y = -4; p.x = Math.random() * w; }
                if (p.x < -4) p.x = w + 4;
                if (p.x > w + 4) p.x = -4;

                // Spotlight interaction: brighten + enlarge particles near the cursor.
                const spotlightRadius = 170;
                const spotlightRaw = Math.max(0, 1 - dist / spotlightRadius);
                const spotlightStrength = spotlightRaw * spotlightRaw;
                const finalSize = p.size * (1 + spotlightStrength * 1.6);
                const haloRadius = spotlightStrength > 0.01
                    ? finalSize * (2.6 + spotlightStrength * 1.8)
                    : 0;
                const renderRadius = Math.max(finalSize, haloRadius);

                // Edge-aware fade so enlarged particles/halos disappear before canvas clipping.
                const topFadeLimit = h * 0.15;
                const bottomFadeStart = h * 0.68;
                const topFade = (p.y - renderRadius) < topFadeLimit
                    ? Math.max(0, (p.y + renderRadius) / (topFadeLimit + renderRadius))
                    : 1;
                const bottomFade = (p.y + renderRadius) > bottomFadeStart
                    ? Math.max(0, 1 - ((p.y + renderRadius) - bottomFadeStart) / ((h - bottomFadeStart) + renderRadius))
                    : 1;
                const edgeFade = Math.max(0, Math.min(topFade, bottomFade));
                const baseOpacity = p.opacity * edgeFade;
                const finalOpacity = Math.min(0.95, baseOpacity * (1 + spotlightStrength * 1.8));

                if (spotlightStrength > 0.01 && edgeFade > 0.01) {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, haloRadius, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255, 244, 212, ${0.14 * spotlightStrength * edgeFade})`;
                    ctx.fill();
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, finalSize, 0, Math.PI * 2);
                ctx.shadowBlur = 20 * spotlightStrength * edgeFade;
                ctx.shadowColor = 'rgba(255, 240, 200, 0.95)';
                ctx.fillStyle = `${p.color}${finalOpacity})`;
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            rafRef.current = requestAnimationFrame(draw);
        };

        rafRef.current = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(rafRef.current);
            clearTimeout(touchClearId);
            ro.disconnect();
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseleave', onMouseLeaveWindow);
            window.removeEventListener('scroll', onViewportChange);
            window.removeEventListener('resize', onViewportChange);
            parent.removeEventListener('touchmove', onTouchMove);
            parent.removeEventListener('touchend', onTouchEnd);
        };
    }, [count]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 1 }}
            aria-hidden
        />
    );
}
