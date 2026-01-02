import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface PageLayoutProps {
  children: React.ReactNode;
}

function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="bg-background flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar - Title is now dynamic based on URL */}
        <Topbar />

        {/* Page Content */}
        <main className="bg-background flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default PageLayout;
