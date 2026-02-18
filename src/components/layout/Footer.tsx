export function Footer() {
    return (
        <footer className="py-12 text-center">
            <div className="gallery-divider mb-6" />
            <p className="text-xs tracking-[0.2em] uppercase font-body"
                style={{ color: 'var(--color-text-tertiary)' }}>
                © {new Date().getFullYear()} Coleman Lai
            </p>
        </footer>
    );
}
