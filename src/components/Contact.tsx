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
        <section id="contact" className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 dark:text-white">Contact</h2>
            <div className="flex flex-col gap-4">
                {contacts.map((contact) => (
                    <a
                        key={contact.name}
                        href={contact.href}
                        target="_blank"
                        rel="noopener"
                        className="border-2 rounded-lg px-4 py-2 dark:border-gray-700 border-gray-400 hover:[box-shadow:0_0_15px_2px_rgba(0,0,0,0.2)] dark:hover:[box-shadow:0_0_15px_2px_rgba(255,255,255,0.2)] transition-all hover:scale-[1.02] flex items-center gap-4"
                    >
                        <div className="text-gray-600 dark:text-gray-200">
                            {contact.icon}
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="font-bold text-gray-900 dark:text-white">
                                {contact.name}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                                {contact.value}
                            </span>
                        </div>
                    </a>
                ))}
            </div>
        </section>
    );
}
