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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <Heading level={1}>
                                Content Admin
                            </Heading>
                            <Text className="text-gray-600 dark:text-gray-400">
                                Manage your personal website content
                            </Text>
                        </div>
                        <Button
                            onClick={onLogout}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            {/* Navigation */}
            <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8">
                        {tabs.map((tab) => (
                            <Button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
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
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                            <Heading level={2} className="mb-4">
                                Welcome to Admin Panel
                            </Heading>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                    <Heading level={3} className="font-medium text-blue-900 dark:text-blue-100">Quick Actions</Heading>
                                    <ul className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-300">
                                        <li>• Create new project</li>
                                        <li>• Add origami design</li>
                                        <li>• Upload images</li>
                                    </ul>
                                </div>
                                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                                    <Heading level={3} className="font-medium text-green-900 dark:text-green-100">Features</Heading>
                                    <ul className="mt-2 space-y-1 text-sm text-green-700 dark:text-green-300">
                                        <li>• Auto-generated metadata</li>
                                        <li>• Image optimization</li>
                                        <li>• SEO fields</li>
                                    </ul>
                                </div>
                                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                                    <Heading level={3} className="font-medium text-purple-900 dark:text-purple-100">Tips</Heading>
                                    <ul className="mt-2 space-y-1 text-sm text-purple-700 dark:text-purple-300">
                                        <li>• Use descriptive slugs</li>
                                        <li>• Add alt text to images</li>
                                        <li>• Include relevant keywords</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'new-project' && (
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                            <Heading level={2} className="mb-6">
                                Create New Project
                            </Heading>
                            <ProjectForm />
                        </div>
                    )}

                    {activeTab === 'new-origami' && (
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                            <Heading level={2} className="mb-6">
                                Add New Origami
                            </Heading>
                            <OrigamiForm />
                        </div>
                    )}

                    {activeTab === 'manage' && (
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
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
