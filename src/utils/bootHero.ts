/** Spotlight on the static hero. Runs with the app shell, not the gallery catalogs. */
export function bindBootHero(): () => void {
    const el = document.getElementById('boot-hero');
    if (!el) return () => {};
    const name = el.querySelector('h1');
    const spotlight = el.querySelector('.hero-spotlight') as HTMLElement | null;

    const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    const onMove = (e: MouseEvent) => {
        if (!finePointer() || !spotlight) return;
        if (!spotlight.classList.contains('visible')) spotlight.classList.add('visible');
        const rect = el.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        spotlight.style.setProperty('--hero-x', `${x}%`);
        spotlight.style.setProperty('--hero-y', `${y}%`);
        if (!(name instanceof HTMLElement)) return;

        const nameRect = name.getBoundingClientRect();
        const relX = ((e.clientX - nameRect.left) / nameRect.width) * 100;
        const relY = ((e.clientY - nameRect.top) / nameRect.height) * 100;
        const cx = nameRect.left + nameRect.width / 2;
        const cy = nameRect.top + nameRect.height / 2;
        const dx = (e.clientX - cx) / (nameRect.width * 1.5);
        const dy = (e.clientY - cy) / 300;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const raw = Math.max(0, 1 - dist);
        const intensity = raw * raw * (3 - 2 * raw);
        const radius = 22 + 20 * (1 - intensity);
        const t = intensity <= 0 ? 0 : intensity < 0.06 ? intensity / 0.06 : 1;
        const r = Math.round(232 + 23 * t);
        const g = Math.round(228 + 27 * t);
        const b = Math.round(222 + 33 * t);
        const bright = `rgb(${r}, ${g}, ${b})`;
        const base = '#e8e4de';
        name.style.backgroundImage = `radial-gradient(ellipse ${radius}% ${radius * 0.7}% at ${relX}% ${relY}%, ${bright}, ${base})`;
        name.style.webkitBackgroundClip = 'text';
        name.style.backgroundClip = 'text';
        name.style.color = 'transparent';
        name.style.webkitTextFillColor = 'transparent';
        name.style.filter = `drop-shadow(0 0 ${40 * intensity}px rgba(255, 248, 230, ${0.85 * intensity})) drop-shadow(0 0 ${14 * intensity}px rgba(255, 255, 248, ${0.5 * intensity}))`;
        name.style.transition = 'none';
    };

    const onLeave = () => {
        spotlight?.classList.remove('visible');
        if (!(name instanceof HTMLElement)) return;
        name.style.transition = 'filter 0.5s ease-out';
        name.style.backgroundImage = 'linear-gradient(90deg, #e8e4de 0%, #e8e4de 100%)';
        name.style.filter = 'drop-shadow(0 0 0px rgba(255, 248, 230, 0)) drop-shadow(0 0 0px rgba(255, 255, 248, 0))';
    };

    const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting || !(name instanceof HTMLElement)) return;
        name.style.backgroundImage = 'none';
        name.style.color = '#e8e4de';
        name.style.webkitTextFillColor = 'unset';
        name.style.filter = 'drop-shadow(0 0 0px rgba(255, 248, 230, 0))';
        spotlight?.classList.remove('visible');
    }, { threshold: 0 });

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    observer.observe(el);

    return () => {
        el.removeEventListener('mousemove', onMove);
        el.removeEventListener('mouseleave', onLeave);
        observer.disconnect();
    };
}
