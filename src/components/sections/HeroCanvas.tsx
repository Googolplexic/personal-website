import { useEffect, useRef, useCallback } from 'react';

interface Particle {
    x: number;
    y: number;
    baseX: number;
    baseY: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    baseOpacity: number;
    drift: number;
    phase: number;
}

/**
 * HeroCanvas — subtle constellation of golden dust motes
 * that drift gently and scatter from the mouse cursor,
 * like particles caught in a museum spotlight beam.
 */
export function HeroCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: -1000, y: -1000 });
    const particlesRef = useRef<Particle[]>([]);
    const rafRef = useRef<number>(0);
    const dprRef = useRef(1);

    const initParticles = useCallback((w: number, h: number) => {
        const count = Math.floor((w * h) / 12000); // density scales with area
        const particles: Particle[] = [];
        for (let i = 0; i < count; i++) {
            const x = Math.random() * w;
            const y = Math.random() * h;
            particles.push({
                x, y,
                baseX: x,
                baseY: y,
                vx: 0,
                vy: 0,
                size: Math.random() * 1.5 + 0.5,
                opacity: 0,
                baseOpacity: Math.random() * 0.3 + 0.08,
                drift: Math.random() * 0.15 + 0.05,
                phase: Math.random() * Math.PI * 2,
            });
        }
        particlesRef.current = particles;
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        dprRef.current = dpr;

        const resize = () => {
            const rect = canvas.parentElement?.getBoundingClientRect();
            if (!rect) return;
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;
            ctx.scale(dpr, dpr);
            initParticles(rect.width, rect.height);
        };

        resize();
        window.addEventListener('resize', resize);

        let time = 0;
        const animate = () => {
            const rect = canvas.parentElement?.getBoundingClientRect();
            if (!rect) { rafRef.current = requestAnimationFrame(animate); return; }

            const w = rect.width;
            const h = rect.height;
            ctx.setTransform(dprRef.current, 0, 0, dprRef.current, 0, 0);
            ctx.clearRect(0, 0, w, h);

            time += 0.008;
            const mx = mouseRef.current.x;
            const my = mouseRef.current.y;
            const interactRadius = 150;
            const particles = particlesRef.current;

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                // Gentle autonomous drift
                p.baseX += Math.sin(time + p.phase) * p.drift * 0.3;
                p.baseY += Math.cos(time * 0.7 + p.phase) * p.drift * 0.2;

                // Wrap around edges
                if (p.baseX < -10) p.baseX = w + 10;
                if (p.baseX > w + 10) p.baseX = -10;
                if (p.baseY < -10) p.baseY = h + 10;
                if (p.baseY > h + 10) p.baseY = -10;

                // Mouse repulsion
                const dx = p.x - mx;
                const dy = p.y - my;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < interactRadius && dist > 0) {
                    const force = (1 - dist / interactRadius) * 2.5;
                    p.vx += (dx / dist) * force;
                    p.vy += (dy / dist) * force;
                    // Brighten near mouse
                    p.opacity = Math.min(p.baseOpacity + (1 - dist / interactRadius) * 0.5, 0.7);
                } else {
                    p.opacity += (p.baseOpacity - p.opacity) * 0.03;
                }

                // Spring back to base position
                p.vx += (p.baseX - p.x) * 0.015;
                p.vy += (p.baseY - p.y) * 0.015;

                // Damping
                p.vx *= 0.92;
                p.vy *= 0.92;

                p.x += p.vx;
                p.y += p.vy;

                // Draw
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(201, 168, 76, ${p.opacity})`;
                ctx.fill();
            }

            // Draw subtle connection lines between nearby particles near the mouse
            if (mx > 0 && my > 0) {
                for (let i = 0; i < particles.length; i++) {
                    const a = particles[i];
                    const daMouse = Math.hypot(a.x - mx, a.y - my);
                    if (daMouse > interactRadius * 1.5) continue;

                    for (let j = i + 1; j < particles.length; j++) {
                        const b = particles[j];
                        const dab = Math.hypot(a.x - b.x, a.y - b.y);
                        if (dab > 80) continue;

                        const dbMouse = Math.hypot(b.x - mx, b.y - my);
                        if (dbMouse > interactRadius * 1.5) continue;

                        const lineOpacity = (1 - dab / 80) * 0.12;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.strokeStyle = `rgba(201, 168, 76, ${lineOpacity})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }

            rafRef.current = requestAnimationFrame(animate);
        };

        rafRef.current = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(rafRef.current);
            window.removeEventListener('resize', resize);
        };
    }, [initParticles]);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = canvasRef.current?.parentElement?.getBoundingClientRect();
        if (!rect) return;
        mouseRef.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    }, []);

    const handleMouseLeave = useCallback(() => {
        mouseRef.current = { x: -1000, y: -1000 };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="absolute inset-0 pointer-events-auto"
            style={{ zIndex: 1 }}
        />
    );
}
