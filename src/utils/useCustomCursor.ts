import { useEffect } from 'react';

/**
 * Custom cursor: visible gold dot + soft ambient glow.
 * Glow pulses on interactive elements.
 * Desktop only — disabled on touch devices.
 * Respects prefers-reduced-motion.
 */
export function useCustomCursor() {
    useEffect(() => {
        return;
        // Only on hover-capable (desktop) devices with a fine pointer (mouse/trackpad)
        // Using both checks because Chrome Android can falsely report (hover: hover)
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        // Create dot (sharp center) and glow (soft aura)
        const dot = document.createElement('div');
        dot.className = 'custom-cursor-dot';
        document.body.appendChild(dot);

        const glow = document.createElement('div');
        glow.className = 'custom-cursor-glow';
        document.body.appendChild(glow);

        // Hide default cursor
        document.documentElement.classList.add('custom-cursor-active');

        let isVisible = false;

        const onMouseMove = (e: MouseEvent) => {
            const x = `${e.clientX}px`;
            const y = `${e.clientY}px`;
            dot.style.left = x;
            dot.style.top = y;
            glow.style.left = x;
            glow.style.top = y;

            if (!isVisible) {
                isVisible = true;
                dot.classList.add('visible');
                glow.classList.add('visible');
            }
        };

        // Detect hoverable elements
        const onMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest('a, button, [role="button"], .cursor-pointer, input, select, textarea, [onclick]')) {
                dot.classList.add('hovering');
                glow.classList.add('hovering');
            }
        };

        const onMouseOut = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest('a, button, [role="button"], .cursor-pointer, input, select, textarea, [onclick]')) {
                dot.classList.remove('hovering');
                glow.classList.remove('hovering');
            }
        };

        const onMouseLeave = () => {
            isVisible = false;
            dot.classList.remove('visible');
            glow.classList.remove('visible');
        };

        const onMouseEnter = () => {
            isVisible = true;
            dot.classList.add('visible');
            glow.classList.add('visible');
        };

        // Clear hovering on click — navigation may prevent mouseout from firing
        const onClick = () => {
            dot.classList.remove('hovering');
            glow.classList.remove('hovering');
        };

        window.addEventListener('mousemove', onMouseMove, { passive: true });
        document.addEventListener('mouseover', onMouseOver, { passive: true });
        document.addEventListener('mouseout', onMouseOut, { passive: true });
        document.addEventListener('click', onClick, { passive: true });
        document.documentElement.addEventListener('mouseleave', onMouseLeave);
        document.documentElement.addEventListener('mouseenter', onMouseEnter);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseover', onMouseOver);
            document.removeEventListener('mouseout', onMouseOut);
            document.removeEventListener('click', onClick);
            document.documentElement.removeEventListener('mouseleave', onMouseLeave);
            document.documentElement.removeEventListener('mouseenter', onMouseEnter);
            document.documentElement.classList.remove('custom-cursor-active');
            dot.remove();
            glow.remove();
        };
    }, []);
}
