import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { type BreadcrumbItem } from '@/types';

export default function AppSidebarLayout({ children = [] }: { children: React.ReactNode; breadcrumbs?: BreadcrumbItem[] }) {
    return (
        <AppShell variant="sidebar">
            <AppContent variant="sidebar">
                {children}
            </AppContent>
        </AppShell>
    );
}
