import { FiDownload } from 'react-icons/fi';

export function ResumeSection() {
    return (
        <section id="resume" className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 dark:text-white">Resume</h2>
            <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors no-underline dark:text-white"
            >
                <FiDownload className="w-5 h-5" />
                <span>View Resume</span>
            </a>
        </section>
    );
}
