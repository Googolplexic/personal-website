import { useState } from 'react';
import { ProjectForm } from './ProjectForm';
import { OrigamiForm } from './OrigamiForm';
import { ContentList } from './ContentList';

interface AdminDashboardProps {
    onLogout: () => void;
}

type ActiveTab = 'new-project' | 'new-origami' | 'manage';

const TABS: { id: ActiveTab; label: string }[] = [
    { id: 'manage', label: 'Library' },
    { id: 'new-project', label: 'New project' },
    { id: 'new-origami', label: 'New origami' },
];

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
    const [activeTab, setActiveTab] = useState<ActiveTab>('manage');

    return (
        <div className="admin-page">
            <div className="flex items-end justify-between gap-4">
                <div>
                    <p className="gallery-overline mb-3">Site</p>
                    <h1 className="admin-title">Admin</h1>
                </div>
                <button type="button" className="admin-link" onClick={onLogout}>
                    Log out
                </button>
            </div>

            <div className="admin-tabs" role="tablist" aria-label="Admin sections">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        id={`admin-tab-${tab.id}`}
                        aria-selected={activeTab === tab.id}
                        aria-controls={`admin-panel-${tab.id}`}
                        className="admin-tab"
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div
                role="tabpanel"
                id={`admin-panel-${activeTab}`}
                aria-labelledby={`admin-tab-${activeTab}`}
            >
                {activeTab === 'new-project' && <ProjectForm />}
                {activeTab === 'new-origami' && <OrigamiForm />}
                {activeTab === 'manage' && <ContentList />}
            </div>
        </div>
    );
}
