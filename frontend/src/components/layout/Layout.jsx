import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Footer } from './Footer';

export const Layout = ({ children, title }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827]">
      <div className="md:flex">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className={`flex min-h-screen flex-1 flex-col md:pb-8 ${collapsed ? 'md:pl-20' : 'md:pl-60'}`}>
          <Topbar title={title} />
          <main className="flex-1 px-4 py-6 pb-24 sm:px-6">
            <div className="mx-auto max-w-[1440px] space-y-6">{children}</div>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};

