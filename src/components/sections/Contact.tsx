import { FiMail } from 'react-icons/fi';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { Heading, Card, Flex, Text, Stack } from '../ui/base';

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
            <Heading level={2}>Contact</Heading>
            <Stack spacing="4">
                {contacts.map((contact) => (
                    <a
                        key={contact.name}
                        href={contact.href}
                        target="_blank"
                        rel="noopener"
                        className="no-underline"
                    >
                        <Card variant="interactive" padding="md" className="h-full">
                            <Flex align="center" gap="4">
                                <Text color="secondary" className="text-gray-600 dark:text-gray-200">
                                    {contact.icon}
                                </Text>
                                <Flex direction="col" className="text-left">
                                    <Text weight="bold">
                                        {contact.name}
                                    </Text>
                                    <Text color="secondary">
                                        {contact.value}
                                    </Text>
                                </Flex>
                            </Flex>
                        </Card>
                    </a>
                ))}
            </Stack>
        </section>
    );
}
