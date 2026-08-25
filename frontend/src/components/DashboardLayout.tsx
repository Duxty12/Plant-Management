import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="ml-[250px] flex-1 min-h-screen p-8 bg-gray-50">
        {children}
      </main>
    </div>
  );
}

