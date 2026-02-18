import { FiDownload } from 'react-icons/fi';

export function ResumeSection() {
    return (
        <div id="resume">
            <p className="gallery-overline mb-6">Documents</p>
            <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 font-body text-xs tracking-[0.15em] uppercase no-underline transition-all duration-300 hover:!text-[var(--color-accent)] hover:!border-[var(--color-accent)]"
                style={{
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-accent)',
                    borderColor: 'rgba(201, 168, 76, 0.4)'
                }}
            >
                <FiDownload className="w-3.5 h-3.5" />
                <span>View Resume</span>
            </a>
        </div>
    );
}
