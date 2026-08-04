import { useEffect } from 'react';

/**
 * Custom cursor: gold dot + soft glow.
 * A real scrollbar thumb sits on the right; approaching it docks the
 * cursor into that thumb (one thumb, not a ghost + cursor). Drag to scroll.
 * Desktop only. Respects prefers-reduced-motion.
 */
export function useCustomCursor() {
    useEffect(() => {
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const dot = document.createElement('div');
        dot.className = 'custom-cursor-dot';
        document.body.appendChild(dot);

        const glow = document.createElement('div');
        glow.className = 'custom-cursor-glow';
        document.body.appendChild(glow);

        const track = document.createElement('div');
        track.className = 'custom-scrollbar-track';
        document.body.appendChild(track);

        const thumb = document.createElement('div');
        thumb.className = 'custom-scrollbar-thumb';
        document.body.appendChild(thumb);

        document.documentElement.classList.add('custom-cursor-active');

        let isVisible = false;
        let idleFadeId: ReturnType<typeof setTimeout> | undefined;
        let rafId = 0;
        let scrollbarDragging = false;
        let dragGrabOffset = 0;
        let dockAmount = 0;
        let scrollActivity = 0;
        let thumbOpacity = 0;
        let trackOpacity = 0;
        let railInterest = 0;

        let pointerX = window.innerWidth / 2;
        let pointerY = window.innerHeight / 2;
        let renderX = pointerX;
        let renderY = pointerY;
        let docked = false;

        const IDLE_FADE_MS = 1400;
        const RAIL_ZONE_PX = 48;
        const DOCK_Y_PAD_PX = 28;
        const TRACK_X_INSET = 4;
        const MIN_THUMB_PX = 40;
        const LERP_POS = 0.28;
        const LERP_DOCK = 0.2;
        const LERP_CHROME = 0.08; // slow fade for thumb/track so nothing pops
        const THUMB_IDLE = 0.22;
        const THUMB_ACTIVE = 0.55;
        const TRACK_IDLE = 0.08;
        const TRACK_ACTIVE = 0.32;
        const INTERACTIVE_SELECTOR = 'a, button, [role="button"], .cursor-pointer, input, textarea, select, [onclick]';
        const TEXT_INPUT_SELECTOR = 'input, textarea, [contenteditable], [role="textbox"]';
        const TEXT_INPUT_TYPES = new Set([
            'text', 'search', 'email', 'url', 'tel', 'password', 'number',
            'date', 'datetime-local', 'month', 'time', 'week',
        ]);

        const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
        const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
        const easeOut = (t: number) => 1 - (1 - t) * (1 - t);

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

        const getScrollMetrics = () => {
            const viewH = window.innerHeight;
            const scrollH = Math.max(
                document.documentElement.scrollHeight,
                document.body.scrollHeight,
            );
            const maxScroll = Math.max(0, scrollH - viewH);
            const thumbH = maxScroll <= 0
                ? viewH
                : Math.min(viewH, Math.max(MIN_THUMB_PX, (viewH / scrollH) * viewH));
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const usable = Math.max(1, viewH - thumbH);
            const thumbCenterY = maxScroll <= 0
                ? viewH / 2
                : (scrollTop / maxScroll) * usable + thumbH / 2;
            return { viewH, scrollH, maxScroll, thumbH, usable, thumbCenterY, scrollTop };
        };

        const setScrollFromThumbCenter = (thumbCenterY: number) => {
            const { maxScroll, thumbH, usable, viewH } = getScrollMetrics();
            if (maxScroll <= 0) return;
            const clamped = clamp(thumbCenterY, thumbH / 2, viewH - thumbH / 2);
            window.scrollTo({ top: ((clamped - thumbH / 2) / usable) * maxScroll, behavior: 'auto' });
        };

        const setCursorMode = (target: Element | null) => {
            if (dockAmount > 0.25 || scrollbarDragging) return;
            const isTextInput = isTextInputElement(target);
            const isInteractive = isTextInput || isInteractiveElement(target);
            dot.classList.toggle('text-input', isTextInput);
            glow.classList.toggle('text-input', isTextInput);
            dot.classList.toggle('hovering', isInteractive && !isTextInput);
            glow.classList.toggle('hovering', isInteractive && !isTextInput);
        };

        const clearPressState = () => {
            if (scrollbarDragging) return;
            dot.classList.remove('pressing');
            glow.classList.remove('pressing');
        };

        const hideCursor = () => {
            if (scrollbarDragging) return;
            isVisible = false;
            dot.classList.remove('visible');
            glow.classList.remove('visible');
            clearPressState();
            document.documentElement.classList.remove('custom-cursor-visible');
        };

        const scheduleIdleFade = () => {
            if (idleFadeId) clearTimeout(idleFadeId);
            if (scrollbarDragging || dockAmount > 0.2) return;
            idleFadeId = setTimeout(hideCursor, IDLE_FADE_MS);
        };

        const bumpScrollActivity = () => {
            scrollActivity = 1;
        };

        const tick = () => {
            const { viewH, maxScroll, thumbH, thumbCenterY } = getScrollMetrics();
            const canScroll = maxScroll > 0;
            const trackX = window.innerWidth - TRACK_X_INSET;
            const distFromRight = window.innerWidth - pointerX;
            const distFromThumbY = Math.abs(pointerY - thumbCenterY);
            const thumbHitSlop = thumbH / 2 + DOCK_Y_PAD_PX;

            // Soft proximity (not a hard on/off zone)
            const railProximity = canScroll
                ? easeOut(clamp(1 - distFromRight / (RAIL_ZONE_PX * 1.6), 0, 1))
                : 0;
            const nearRail = railProximity > 0.35;
            const nearThumb = nearRail && distFromThumbY <= thumbHitSlop;
            const wantDock = scrollbarDragging || nearThumb || (docked && nearRail);

            const targetDock = wantDock
                ? easeOut(clamp(1 - distFromRight / RAIL_ZONE_PX, 0, 1))
                : 0;
            dockAmount = lerp(dockAmount, scrollbarDragging ? 1 : targetDock, LERP_DOCK);
            if (dockAmount < 0.01) dockAmount = 0;
            if (dockAmount > 0.99) dockAmount = 1;
            docked = dockAmount > 0.55;

            // Activity decays smoothly each frame instead of snapping off
            scrollActivity = lerp(scrollActivity, 0, 0.03);
            if (scrollActivity < 0.01) scrollActivity = 0;

            // Same idle rule as the cursor: only show chrome while the pointer
            // is active (or while scrolling / dragging the thumb).
            const chromeActive = isVisible || scrollbarDragging || scrollActivity > 0.02;

            railInterest = lerp(
                railInterest,
                chromeActive ? Math.max(railProximity, scrollActivity * 0.9) : 0,
                LERP_CHROME,
            );

            if (canScroll && chromeActive) {
                const crossfade = 1 - dockAmount * dockAmount;
                const boost = lerp(THUMB_IDLE, THUMB_ACTIVE, railInterest);
                const trackBoost = lerp(TRACK_IDLE, TRACK_ACTIVE, Math.max(railInterest, dockAmount));
                thumbOpacity = lerp(thumbOpacity, boost * crossfade, LERP_CHROME);
                trackOpacity = lerp(trackOpacity, trackBoost, LERP_CHROME);
            } else {
                thumbOpacity = lerp(thumbOpacity, 0, LERP_CHROME);
                trackOpacity = lerp(trackOpacity, 0, LERP_CHROME);
            }

            thumb.style.height = `${thumbH}px`;
            thumb.style.top = `${thumbCenterY}px`;
            thumb.style.opacity = String(thumbOpacity);
            track.style.opacity = String(trackOpacity);
            thumb.classList.toggle('visible', thumbOpacity > 0.02);
            track.classList.toggle('visible', trackOpacity > 0.02);

            let targetX = pointerX;
            let targetY = pointerY;

            if (scrollbarDragging) {
                targetX = trackX;
                targetY = clamp(pointerY - dragGrabOffset, thumbH / 2, viewH - thumbH / 2);
                setScrollFromThumbCenter(targetY);
            } else if (dockAmount > 0) {
                // Merge onto the real thumb — position and shape become that thumb
                targetX = lerp(pointerX, trackX, dockAmount);
                targetY = lerp(pointerY, thumbCenterY, dockAmount);
            }

            if (scrollbarDragging || dockAmount > 0.01) {
                const posLerp = scrollbarDragging ? 0.5 : LERP_POS;
                renderX = lerp(renderX, targetX, posLerp);
                renderY = lerp(renderY, targetY, posLerp);
                if (Math.abs(renderX - targetX) < 0.2) renderX = targetX;
                if (Math.abs(renderY - targetY) < 0.2) renderY = targetY;
            } else {
                renderX = targetX;
                renderY = targetY;
            }

            const left = `${renderX}px`;
            const top = `${renderY}px`;
            dot.style.left = left;
            dot.style.top = top;
            glow.style.left = left;
            glow.style.top = top;

            if (dockAmount > 0.02 && canScroll) {
                const h = lerp(12, thumbH, dockAmount);
                const w = lerp(12, 6, dockAmount);
                dot.classList.add('scrollbar');
                glow.classList.add('scrollbar');
                dot.classList.remove('hovering', 'text-input');
                glow.classList.remove('hovering', 'text-input');
                dot.style.width = `${w}px`;
                dot.style.height = `${h}px`;
                glow.style.width = `${lerp(36, 22, dockAmount)}px`;
                glow.style.height = `${h + 16 * dockAmount}px`;
            } else if (dot.classList.contains('scrollbar')) {
                dot.classList.remove('scrollbar');
                glow.classList.remove('scrollbar');
                dot.style.width = '';
                dot.style.height = '';
                glow.style.width = '';
                glow.style.height = '';
            }

            rafId = requestAnimationFrame(tick);
        };

        const onMouseMove = (e: MouseEvent) => {
            pointerX = e.clientX;
            pointerY = e.clientY;

            if (!docked && !scrollbarDragging) {
                setCursorMode(document.elementFromPoint(e.clientX, e.clientY));
            }

            if (!isVisible) {
                isVisible = true;
                renderX = e.clientX;
                renderY = e.clientY;
                dot.classList.add('visible');
                glow.classList.add('visible');
                document.documentElement.classList.add('custom-cursor-visible');
            }

            if (scrollbarDragging || dockAmount > 0.15) {
                if (idleFadeId) clearTimeout(idleFadeId);
            } else {
                scheduleIdleFade();
            }
        };

        const onMouseLeave = () => {
            if (scrollbarDragging) return;
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

            const { maxScroll, thumbH, thumbCenterY, viewH } = getScrollMetrics();
            const distFromRight = window.innerWidth - e.clientX;
            const nearRail = distFromRight <= RAIL_ZONE_PX;

            if (nearRail && maxScroll > 0) {
                pointerX = e.clientX;
                pointerY = e.clientY;
                const onThumb = Math.abs(e.clientY - thumbCenterY) <= thumbH / 2 + 12;

                if (onThumb) {
                    // Grab existing thumb where you clicked
                    dragGrabOffset = e.clientY - thumbCenterY;
                } else {
                    // Clicked the track — jump thumb here, then drag (standard scrollbar UX)
                    dragGrabOffset = 0;
                    const jumpedY = clamp(e.clientY, thumbH / 2, viewH - thumbH / 2);
                    setScrollFromThumbCenter(jumpedY);
                }

                scrollbarDragging = true;
                document.body.style.userSelect = 'none';
                dot.classList.add('pressing');
                glow.classList.add('pressing');
                if (idleFadeId) clearTimeout(idleFadeId);
                return;
            }

            if (window.getSelection()?.type === 'Range') return;
            dot.classList.add('pressing');
            glow.classList.add('pressing');
        };

        const onMouseUp = () => {
            if (scrollbarDragging) {
                scrollbarDragging = false;
                dragGrabOffset = 0;
                document.body.style.userSelect = '';
            }
            clearPressState();
        };

        const onClick = (e: MouseEvent) => {
            setCursorMode(e.target instanceof Element ? e.target : null);
        };

        const onScroll = () => {
            bumpScrollActivity();
            // Keep chrome alive with the same idle window as the cursor
            if (idleFadeId) clearTimeout(idleFadeId);
            if (!scrollbarDragging && dockAmount <= 0.2) {
                idleFadeId = setTimeout(hideCursor, IDLE_FADE_MS);
            }
        };

        rafId = requestAnimationFrame(tick);
        window.addEventListener('mousemove', onMouseMove, { passive: true });
        document.addEventListener('mousedown', onMouseDown, { passive: true });
        document.addEventListener('mouseup', onMouseUp, { passive: true });
        document.addEventListener('dragstart', onMouseUp, { passive: true });
        document.addEventListener('click', onClick, { passive: true });
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('blur', onMouseUp);
        document.documentElement.addEventListener('mouseleave', onMouseLeave);
        document.documentElement.addEventListener('mouseenter', onMouseEnter);

        return () => {
            if (idleFadeId) clearTimeout(idleFadeId);
            cancelAnimationFrame(rafId);
            window.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('dragstart', onMouseUp);
            document.removeEventListener('click', onClick);
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('blur', onMouseUp);
            document.documentElement.removeEventListener('mouseleave', onMouseLeave);
            document.documentElement.removeEventListener('mouseenter', onMouseEnter);
            document.documentElement.classList.remove('custom-cursor-active');
            document.documentElement.classList.remove('custom-cursor-visible');
            document.body.style.userSelect = '';
            dot.remove();
            glow.remove();
            track.remove();
            thumb.remove();
        };
    }, []);
}
