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

        const onMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        };
        const onMouseLeave = () => { mouseRef.current = { x: -9999, y: -9999 }; };

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
        parent.addEventListener('mousemove', onMouseMove);
        parent.addEventListener('mouseleave', onMouseLeave);
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

                // Fade out in top 15% (just entered) and bottom 25% (blends with gradient)
                const topFade = p.y < h * 0.15 ? p.y / (h * 0.15) : 1;
                const bottomFade = p.y > h * 0.75 ? 1 - (p.y - h * 0.75) / (h * 0.25) : 1;
                const finalOpacity = p.opacity * Math.max(0, Math.min(topFade, bottomFade));

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `${p.color}${finalOpacity})`;
                ctx.fill();
            }

            rafRef.current = requestAnimationFrame(draw);
        };

        rafRef.current = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(rafRef.current);
            clearTimeout(touchClearId);
            ro.disconnect();
            parent.removeEventListener('mousemove', onMouseMove);
            parent.removeEventListener('mouseleave', onMouseLeave);
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
