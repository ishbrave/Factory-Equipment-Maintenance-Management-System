import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
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
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#6B7280]">SmartPark</p>
          <h1 className="text-2xl font-bold text-[#111827]">{title}</h1>
        </div>
        <div className="flex flex-1 items-center justify-end gap-4">
          <div className="relative">
            <button
              type="button"
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
                <button
                  type="button"
                  className="w-full rounded-b-3xl px-4 py-3 text-left text-sm text-[#EF4444] hover:bg-[#FEF2F2]"
                  onClick={logout}
                >
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
