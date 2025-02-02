interface HighlightedTextProps {
    text: string;
    searchTerm: string;
    className?: string;
    allowHtml?: boolean;
}

export function HighlightedText({ text, searchTerm, className = "", allowHtml = false }: HighlightedTextProps) {
    if (!searchTerm || !text) return <span className={className}>{text}</span>;

    const escapedSearchTerm = searchTerm
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .replace(/\s+/g, '\\s+');

    if (allowHtml) {

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = text;
        const textContent = tempDiv.textContent || tempDiv.innerText;

        if (!new RegExp(escapedSearchTerm, 'gi').test(textContent)) {
            return <span className={className} dangerouslySetInnerHTML={{ __html: text }} />;
        }

        const highlighted = text.replace(
            new RegExp(`(<[^>]*>|${escapedSearchTerm})`, 'gi'),
            (match) => {
                if (match.startsWith('<')) return match;

                const matchLower = match.toLowerCase();
                if (matchLower === searchTerm.toLowerCase()) {
                    return `<mark class="bg-purple-300 dark:bg-purple-800 dark:text-white rounded px-0.5">${match}</mark>`;
                }
                return match;
            }
        );

        return <span className={className} dangerouslySetInnerHTML={{ __html: highlighted }} />;
    }

    const parts = text.split(new RegExp(`(${escapedSearchTerm})`, 'gi'));
    return (
        <span className={className}>
            {parts.map((part, i) => (
                part.toLowerCase() === searchTerm.toLowerCase()
                    ? <mark key={i} className="bg-purple-300 dark:bg-purple-800 dark:text-white rounded px-0.5">{part}</mark>
                    : <span key={i}>{part}</span>
            ))}
        </span>
    );
}
