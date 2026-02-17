import { useState } from 'react';
import { ProjectForm } from './ProjectForm';
import { OrigamiForm } from './OrigamiForm';
import { ContentList } from './ContentList';
import { Heading, Text, Button } from '../ui/base';

interface AdminDashboardProps {
    onLogout: () => void;
}

type ActiveTab = 'overview' | 'new-project' | 'new-origami' | 'manage';

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
    const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

    const tabs = [
        { id: 'overview' as const, label: 'Overview', icon: '📊' },
        { id: 'new-project' as const, label: 'New Project', icon: '💻' },
        { id: 'new-origami' as const, label: 'New Origami', icon: '🎨' },
        { id: 'manage' as const, label: 'Manage Content', icon: '📝' },
    ];

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)]">
            {/* Header */}
            <header className="bg-[var(--color-bg-surface)] border-b border-[var(--color-border)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <Heading level={1}>
                                Content Admin
                            </Heading>
                            <Text className="text-[var(--color-text-tertiary)]">
                                Manage your personal website content
                            </Text>
                        </div>
                        <Button
                            onClick={onLogout}
                            className="inline-flex items-center px-4 py-2 border border-red-500/30 text-sm font-medium rounded-md text-red-400 hover:bg-red-500/10 focus:outline-none transition-colors"
                        >
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            {/* Navigation */}
            <nav className="bg-[var(--color-bg-surface)] border-b border-[var(--color-border)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8">
                        {tabs.map((tab) => (
                            <Button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                    ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                                    : 'border-transparent text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:border-[var(--color-border)]'
                                    }`}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.label}
                            </Button>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    {activeTab === 'overview' && (
                        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-6">
                            <Heading level={2} className="mb-4">
                                Welcome to Admin Panel
                            </Heading>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] p-4 rounded-lg">
                                    <Heading level={3} className="font-medium text-[var(--color-text-primary)]">Quick Actions</Heading>
                                    <ul className="mt-2 space-y-1 text-sm text-[var(--color-text-secondary)]">
                                        <li>• Create new project</li>
                                        <li>• Add origami design</li>
                                        <li>• Upload images</li>
                                    </ul>
                                </div>
                                <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] p-4 rounded-lg">
                                    <Heading level={3} className="font-medium text-[var(--color-text-primary)]">Features</Heading>
                                    <ul className="mt-2 space-y-1 text-sm text-[var(--color-text-secondary)]">
                                        <li>• Auto-generated metadata</li>
                                        <li>• Image optimization</li>
                                        <li>• SEO fields</li>
                                    </ul>
                                </div>
                                <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] p-4 rounded-lg">
                                    <Heading level={3} className="font-medium text-[var(--color-text-primary)]">Tips</Heading>
                                    <ul className="mt-2 space-y-1 text-sm text-[var(--color-text-secondary)]">
                                        <li>• Use descriptive slugs</li>
                                        <li>• Add alt text to images</li>
                                        <li>• Include relevant keywords</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'new-project' && (
                        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-6">
                            <Heading level={2} className="mb-6">
                                Create New Project
                            </Heading>
                            <ProjectForm />
                        </div>
                    )}

                    {activeTab === 'new-origami' && (
                        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-6">
                            <Heading level={2} className="mb-6">
                                Add New Origami
                            </Heading>
                            <OrigamiForm />
                        </div>
                    )}

                    {activeTab === 'manage' && (
                        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-6">
                            <Heading level={2} className="mb-6">
                                Manage Existing Content
                            </Heading>
                            <ContentList />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
