import { useLayoutEffect, useState } from 'react';

export function portfolioLeadActiveNow(): boolean {
    if (typeof document === 'undefined') return false;
    const lead = document.getElementById('boot-portfolio-lead');
    if (!lead || lead.hidden || !lead.querySelector('img')) return false;
    return window.matchMedia('(max-width: 639px)').matches;
}

export function usePortfolioLeadActive(): boolean {
    const [active, setActive] = useState(portfolioLeadActiveNow);

    useLayoutEffect(() => {
        const lead = document.getElementById('boot-portfolio-lead');
        if (!lead) return;
        const read = () => setActive(portfolioLeadActiveNow());
        read();
        const mq = window.matchMedia('(max-width: 639px)');
        mq.addEventListener('change', read);
        const observer = new MutationObserver(read);
        observer.observe(lead, { attributes: true, attributeFilter: ['hidden'] });
        return () => {
            mq.removeEventListener('change', read);
            observer.disconnect();
        };
    }, []);

    return active;
}
