import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const Layout = ({ children, title }) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827]">
      <div className="md:flex">
        <Sidebar />
        <div className="flex-1 md:ml-[240px] lg:ml-[240px]">
          <Topbar title={title} />
          <main className="min-h-[calc(100vh-88px)] px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1440px] space-y-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
};
