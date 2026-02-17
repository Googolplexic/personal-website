import { FiMail } from 'react-icons/fi';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

export function Contact() {
    const contacts = [
        {
            name: 'Personal Email',
            value: 'colemancflai@yahoo.com',
            href: 'mailto:colemancflai@yahoo.com',
            icon: <FiMail className="w-5 h-5" />
        },
        {
            name: 'University Email',
            value: 'ccl46@sfu.ca',
            href: 'mailto:ccl46@sfu.ca',
            icon: <FiMail className="w-5 h-5" />
        },
        {
            name: 'LinkedIn',
            value: 'coleman-lai',
            href: 'https://www.linkedin.com/in/coleman-lai',
            icon: <FaLinkedin className="w-5 h-5" />
        },
        {
            name: 'GitHub',
            value: 'Googolplexic',
            href: 'https://github.com/Googolplexic',
            icon: <FaGithub className="w-5 h-5" />
        }
    ];

    return (
        <div id="contact">
            <p className="gallery-overline mb-4">Get in Touch</p>
            <h2 className="gallery-heading text-3xl md:text-4xl mb-8"
                style={{ color: 'var(--color-text-primary)' }}>
                Contact
            </h2>
            <div className="space-y-4">
                {contacts.map((contact) => (
                    <a
                        key={contact.name}
                        href={contact.href}
                        target="_blank"
                        rel="noopener"
                        className="no-underline flex items-center gap-4 py-3 transition-colors duration-300 group"
                        style={{ color: 'var(--color-text-secondary)' }}
                    >
                        <span className="transition-colors duration-300 group-hover:text-[var(--color-accent-text)]" style={{ color: 'var(--color-text-tertiary)' }}>
                            {contact.icon}
                        </span>
                        <div className="text-left">
                            <p className="text-sm font-body"
                               style={{ color: 'var(--color-text-primary)' }}>
                                {contact.name}
                            </p>
                            <p className="text-xs font-body"
                               style={{ color: 'var(--color-text-tertiary)' }}>
                                {contact.value}
                            </p>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}
