import { useEffect } from 'react';

/**
 * Custom cursor: visible gold dot + soft ambient glow.
 * Glow pulses on interactive elements.
 * Desktop only — disabled on touch devices.
 * Respects prefers-reduced-motion.
 */
export function useCustomCursor() {
    useEffect(() => {
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
        let idleFadeId: ReturnType<typeof setTimeout> | undefined;
        const IDLE_FADE_MS = 1400;
        const INTERACTIVE_SELECTOR = 'a, button, [role="button"], .cursor-pointer, input, textarea, select, [onclick]';
        const TEXT_INPUT_SELECTOR = 'input, textarea, [contenteditable], [role="textbox"]';
        const TEXT_INPUT_TYPES = new Set([
            'text',
            'search',
            'email',
            'url',
            'tel',
            'password',
            'number',
            'date',
            'datetime-local',
            'month',
            'time',
            'week',
        ]);

        const isTextInputElement = (target: Element | null) => {
            if (!target) return false;
            const field = target.closest(TEXT_INPUT_SELECTOR);
            if (!field) return false;

            if (field instanceof HTMLTextAreaElement) return true;

            if (field instanceof HTMLInputElement) {
                const inputType = (field.getAttribute('type') || 'text').toLowerCase();
                return TEXT_INPUT_TYPES.has(inputType);
            }

            if (field instanceof HTMLElement && field.isContentEditable) return true;
            return field.getAttribute('role') === 'textbox';
        };

        const isInteractiveElement = (target: Element | null) => {
            if (!target) return false;
            return Boolean(target.closest(INTERACTIVE_SELECTOR));
        };

        const setCursorMode = (target: Element | null) => {
            const isTextInput = isTextInputElement(target);
            const isInteractive = isTextInput || isInteractiveElement(target);

            dot.classList.toggle('text-input', isTextInput);
            glow.classList.toggle('text-input', isTextInput);
            dot.classList.toggle('hovering', isInteractive && !isTextInput);
            glow.classList.toggle('hovering', isInteractive && !isTextInput);
        };

        const clearPressState = () => {
            dot.classList.remove('pressing');
            glow.classList.remove('pressing');
        };

        const hideCursor = () => {
            isVisible = false;
            dot.classList.remove('visible');
            glow.classList.remove('visible');
            clearPressState();
            document.documentElement.classList.remove('custom-cursor-visible');
        };

        const scheduleIdleFade = () => {
            if (idleFadeId) clearTimeout(idleFadeId);
            idleFadeId = setTimeout(() => {
                hideCursor();
            }, IDLE_FADE_MS);
        };

        const onMouseMove = (e: MouseEvent) => {
            const x = `${e.clientX}px`;
            const y = `${e.clientY}px`;
            dot.style.left = x;
            dot.style.top = y;
            glow.style.left = x;
            glow.style.top = y;
            setCursorMode(document.elementFromPoint(e.clientX, e.clientY));

            if (!isVisible) {
                isVisible = true;
                dot.classList.add('visible');
                glow.classList.add('visible');
                document.documentElement.classList.add('custom-cursor-visible');
            }
            scheduleIdleFade();
        };

        const onMouseLeave = () => {
            if (idleFadeId) clearTimeout(idleFadeId);
            hideCursor();
        };

        const onMouseEnter = () => {
            isVisible = true;
            dot.classList.add('visible');
            glow.classList.add('visible');
            document.documentElement.classList.add('custom-cursor-visible');
            scheduleIdleFade();
        };

        const onMouseDown = (e: MouseEvent) => {
            if (e.button !== 0) return;
            if (window.getSelection()?.type === 'Range') return;
            dot.classList.add('pressing');
            glow.classList.add('pressing');
        };

        const onMouseUp = () => {
            clearPressState();
        };

        // Re-evaluate mode on click in case navigation doesn't trigger immediate pointer updates
        const onClick = (e: MouseEvent) => {
            setCursorMode(e.target instanceof Element ? e.target : null);
        };

        window.addEventListener('mousemove', onMouseMove, { passive: true });
        document.addEventListener('mousedown', onMouseDown, { passive: true });
        document.addEventListener('mouseup', onMouseUp, { passive: true });
        document.addEventListener('dragstart', onMouseUp, { passive: true });
        document.addEventListener('click', onClick, { passive: true });
        window.addEventListener('blur', onMouseUp);
        document.documentElement.addEventListener('mouseleave', onMouseLeave);
        document.documentElement.addEventListener('mouseenter', onMouseEnter);

        return () => {
            if (idleFadeId) clearTimeout(idleFadeId);
            window.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('dragstart', onMouseUp);
            document.removeEventListener('click', onClick);
            window.removeEventListener('blur', onMouseUp);
            document.documentElement.removeEventListener('mouseleave', onMouseLeave);
            document.documentElement.removeEventListener('mouseenter', onMouseEnter);
            document.documentElement.classList.remove('custom-cursor-active');
            document.documentElement.classList.remove('custom-cursor-visible');
            dot.remove();
            glow.remove();
        };
    }, []);
}
