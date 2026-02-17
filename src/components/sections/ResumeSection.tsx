import { FiDownload } from 'react-icons/fi';

export function ResumeSection() {
    return (
        <div id="resume">
            <p className="gallery-overline mb-4">Documents</p>
            <h2 className="gallery-heading text-3xl md:text-4xl mb-8"
                style={{ color: 'var(--color-text-primary)' }}>
                Resume
            </h2>
            <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 font-body text-xs tracking-[0.15em] uppercase no-underline transition-colors duration-300"
                style={{
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-text-tertiary)'
                }}
            >
                <FiDownload className="w-3.5 h-3.5" />
                <span>View Resume</span>
            </a>
        </div>
    );
}
