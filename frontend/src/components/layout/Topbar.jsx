import { useState } from 'react';
import { Bell, Search, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getInitials } from '../../utils/formatters';

export const Topbar = ({ title }) => {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const initials = getInitials(user?.username || 'Admin');

  return (
    <header className="sticky top-0 z-30 border-b border-[#E2E8F0] bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#6B7280]">Overview</p>
          <h1 className="text-2xl font-bold text-[#111827]">{title}</h1>
        </div>
        <div className="flex flex-1 items-center justify-end gap-4">
          <label className="relative hidden h-11 flex-1 items-center rounded-full bg-[#F8FAFC] px-4 text-[#6B7280] md:flex">
            <Search size={18} className="mr-3" />
            <input
              type="search"
              placeholder="Search equipment, maintenance..."
              className="w-full bg-transparent text-sm text-[#374151] outline-none placeholder:text-[#9CA3AF]"
              aria-label="Search"
            />
          </label>
          <button className="relative rounded-full bg-[#F8FAFC] p-3 text-[#374151] transition hover:bg-[#E2E8F0]" aria-label="Notifications">
            <Bell size={18} />
            <span className="absolute -right-1 top-1 h-2.5 w-2.5 rounded-full bg-[#EF4444] ring-2 ring-white"></span>
          </button>
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-3 rounded-full border border-[#E2E8F0] bg-white px-4 py-2 text-sm shadow-sm transition hover:border-[#1E40AF]"
              aria-label="Profile menu"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1E40AF] text-white font-semibold">{initials}</div>
              <div className="text-left leading-tight">
                <p className="font-semibold text-[#111827]">{user?.username || 'Admin'}</p>
                <p className="text-xs text-[#6B7280]">Administrator</p>
              </div>
              <ChevronDown size={18} />
            </button>
            {open && (
              <div className="absolute right-0 z-20 mt-3 w-44 rounded-3xl border border-[#E2E8F0] bg-white shadow-2xl">
                <button className="w-full px-4 py-3 text-left text-sm text-[#374151] hover:bg-[#F8FAFC]" onClick={() => setOpen(false)}>
                  Profile
                </button>
                <button className="w-full px-4 py-3 text-left text-sm text-[#374151] hover:bg-[#F8FAFC]" onClick={() => setOpen(false)}>
                  Settings
                </button>
                <button className="w-full rounded-b-3xl px-4 py-3 text-left text-sm text-[#EF4444] hover:bg-[#FEF2F2]" onClick={logout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
