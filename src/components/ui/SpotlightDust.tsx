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
    'rgba(255, 248, 230,',
    'rgba(201, 168, 76,',
    'rgba(255, 240, 200,',
    'rgba(230, 220, 180,',
];

const COUNT = 90;

function makeParticle(w: number, h: number): Particle {
    const opacity = Math.random() * 0.25 + 0.04;
    return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.12,
        vy: Math.random() * 0.16 + 0.04,
        size: Math.random() * 1.2 + 0.5,
        opacity,
        opacityTarget: opacity,
        opacitySpeed: Math.random() * 0.002 + 0.0008,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
}

/**
 * Full-viewport dust canvas that fades in whenever #page-dim is visible
 * (i.e. when a spotlight-group is being hovered).
 */
export function SpotlightDust() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: -9999, y: -9999 });
    const particlesRef = useRef<Particle[]>([]);
    const rafRef = useRef<number>(0);
    const visibleRef = useRef(false);
    const lastScrollY = useRef(window.scrollY);
    const lastPathname = useRef(window.location.pathname);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            if (particlesRef.current.length === 0) {
                particlesRef.current = Array.from({ length: COUNT }, () =>
                    makeParticle(canvas.width, canvas.height)
                );
            }
        };
        resize();
        window.addEventListener('resize', resize, { passive: true });

        const pageDim = document.getElementById('page-dim');

        const draw = () => {
            if (!visibleRef.current) return;
            const w = canvas.width;
            const h = canvas.height;
            ctx.clearRect(0, 0, w, h);

            const currentPath = window.location.pathname;
            if (currentPath !== lastPathname.current) {
                lastPathname.current = currentPath;
                lastScrollY.current = window.scrollY;
                for (const p of particlesRef.current) {
                    p.x = Math.random() * w;
                    p.y = Math.random() * h;
                    p.vx = (Math.random() - 0.5) * 0.12;
                    p.vy = Math.random() * 0.16 + 0.04;
                }
            }

            const customCursorVisible = document.documentElement.classList.contains('custom-cursor-visible');
            const mx = customCursorVisible ? mouseRef.current.x : -9999;
            const my = customCursorVisible ? mouseRef.current.y : -9999;

            for (const p of particlesRef.current) {
                const dx = p.x - mx;
                const dy = p.y - my;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120 && dist > 0) {
                    const force = (120 - dist) / 120 * 0.035;
                    p.vx += (dx / dist) * force;
                    p.vy += (dy / dist) * force;
                }

                p.vx *= 0.98;
                p.vy = p.vy * 0.98 + (Math.random() * 0.22 + 0.06) * 0.02;
                p.x += p.vx;
                p.y += p.vy;

                p.opacity += (p.opacityTarget - p.opacity) * p.opacitySpeed * 60;
                if (Math.abs(p.opacity - p.opacityTarget) < 0.005) {
                    p.opacityTarget = Math.random() * 0.25 + 0.04;
                }

                if (p.y > h + 4) { p.y = -(Math.random() * 30); p.x = Math.random() * w; p.vx = (Math.random() - 0.5) * 0.12; }
                if (p.x < -4) { p.x = w + Math.random() * 4; p.y = Math.random() * h; }
                if (p.x > w + 4) { p.x = -(Math.random() * 4); p.y = Math.random() * h; }

                const spotlightRadius = 150;
                const spotlightRaw = Math.max(0, 1 - dist / spotlightRadius);
                const spotlightStrength = spotlightRaw * spotlightRaw;
                const finalSize = p.size * (1 + spotlightStrength * 0.8);

                const finalOpacity = Math.min(0.6, p.opacity * (1 + spotlightStrength * 1.2));

                if (spotlightStrength > 0.02) {
                    const haloRadius = finalSize * (2.0 + spotlightStrength * 1.2);
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, haloRadius, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255, 244, 212, ${0.07 * spotlightStrength})`;
                    ctx.fill();
                }
                ctx.beginPath();
                ctx.arc(p.x, p.y, finalSize, 0, Math.PI * 2);
                ctx.shadowBlur = 8 * spotlightStrength;
                ctx.shadowColor = 'rgba(255, 240, 200, 0.6)';
                ctx.fillStyle = `${p.color}${finalOpacity})`;
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            if (visibleRef.current) rafRef.current = requestAnimationFrame(draw);
        };

        // Only run the animation loop when dust is visible (spotlight hover).
        // Avoids main-thread work during FCP→TTI and reduces TBT variance.
        const syncVisibility = () => {
            const active = pageDim?.classList.contains('visible') ?? false;
            if (active !== visibleRef.current) {
                visibleRef.current = active;
                canvas.style.opacity = active ? '0.55' : '0';
                if (active) rafRef.current = requestAnimationFrame(draw);
            }
        };

        let observer: MutationObserver | null = null;
        if (pageDim) {
            observer = new MutationObserver(syncVisibility);
            observer.observe(pageDim, { attributes: true, attributeFilter: ['class'] });
        }

        const onMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };
        const onMouseLeave = () => {
            mouseRef.current = { x: -9999, y: -9999 };
        };

        const onScroll = () => {
            const scrollY = window.scrollY;
            const dy = scrollY - lastScrollY.current;
            lastScrollY.current = scrollY;
            if (Math.abs(dy) > canvas.height * 0.75) {
                for (const p of particlesRef.current) {
                    p.x = Math.random() * canvas.width;
                    p.y = Math.random() * canvas.height;
                    p.vx = (Math.random() - 0.5) * 0.12;
                    p.vy = Math.random() * 0.16 + 0.04;
                }
                return;
            }
            const h = canvas.height;
            for (const p of particlesRef.current) {
                p.y -= dy;
                if (p.y < -10) { p.y = h + Math.random() * 40; p.x = Math.random() * canvas.width; }
                else if (p.y > h + 10) { p.y = -(Math.random() * 40); p.x = Math.random() * canvas.width; }
            }
        };

        window.addEventListener('mousemove', onMouseMove, { passive: true });
        window.addEventListener('mouseleave', onMouseLeave);
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => {
            cancelAnimationFrame(rafRef.current);
            observer?.disconnect();
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseleave', onMouseLeave);
            window.removeEventListener('scroll', onScroll);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                inset: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 99,
                opacity: 0,
                transition: 'opacity 0.5s ease',
            }}
            aria-hidden
        />
    );
}
