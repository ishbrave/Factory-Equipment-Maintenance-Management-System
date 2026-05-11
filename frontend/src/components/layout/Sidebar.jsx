import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart2,
  ChevronLeft,
  Cpu,
  LayoutDashboard,
  LogOut,
  Users,
  Wrench,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getInitials } from '../../utils/formatters';

const links = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Equipment', path: '/equipment', icon: Cpu },
  { label: 'Maintenance', path: '/maintenance', icon: Wrench },
  { label: 'Technicians', path: '/technicians', icon: Users },
  { label: 'Reports', path: '/reports', icon: BarChart2 },
];

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const activePath = location.pathname;
  const initials = useMemo(() => getInitials(user?.username || 'Admin'), [user]);

  const sidebarWidth = collapsed ? 'md:w-20' : 'md:w-60';

  return (
    <div className="flex">
      <aside className={`hidden md:flex md:flex-col md:h-screen ${sidebarWidth} bg-[#EFF6FF] border-r border-[#DBEAFE] transition-all duration-200`}>
        <div className="flex h-20 items-center justify-between px-5">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-[#1E40AF] text-white">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
                  <path d="M12 2.25a1 1 0 0 1 .993.883L13 3.25v1.377a7.002 7.002 0 0 1 3.97 2.7l.5-.289a1 1 0 0 1 1.285.366l.07.101 1.75 3a1 1 0 0 1-.18 1.27l-.088.077-1.357 1.14a7.028 7.028 0 0 1 0 1.842l1.357 1.14a1 1 0 0 1 .11 1.398l-.103.115-1.75 3a1 1 0 0 1-1.386.33l-.106-.065-.5-.29A7.002 7.002 0 0 1 13 18.373V19.75a1 1 0 0 1-1.993.117L11 19.75v-1.377a7.002 7.002 0 0 1-3.97-2.7l-.5.289a1 1 0 0 1-1.285-.366l-.07-.101-1.75-3a1 1 0 0 1 .18-1.27l.088-.077 1.357-1.14a7.028 7.028 0 0 1 0-1.842L3.55 8.97a1 1 0 0 1-.11-1.398l.103-.115 1.75-3a1 1 0 0 1 1.386-.33l.106.065.5.29A7.002 7.002 0 0 1 11 5.627V4.25a1 1 0 0 1 1-1z" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-bold text-[#1E40AF]">FEMMS</p>
                <p className="text-xs text-[#6B7280]">Factory maintenance</p>
              </div>
            </div>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-3xl bg-[#1E40AF] text-white">F</div>
          )}
          <button
            className="rounded-full border border-[#DBEAFE] p-2 text-[#6B7280] transition hover:border-[#1E40AF] hover:text-[#1E40AF]"
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Toggle sidebar"
          >
            <ChevronLeft size={18} className={`${collapsed ? 'rotate-180' : ''} transition-transform`} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-2 py-4">
          {links.map(({ path, label, icon: Icon }) => {
            const selected = activePath === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 rounded-3xl px-4 py-3 text-sm transition-all duration-200 ${selected ? 'bg-[#1E40AF] text-white border-l-4 border-[#1E40AF]' : 'text-[#374151] hover:bg-[#F0F4FF] hover:text-[#1E40AF]'}`}
              >
                <Icon size={18} />
                {!collapsed && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="rounded-3xl bg-[#DBEAFE] p-4 m-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1E40AF] text-white font-semibold">
              {initials}
            </div>
            {!collapsed && (
              <div>
                <p className="text-sm font-semibold text-[#1E40AF]">{user?.username || 'Admin'}</p>
                <p className="text-xs text-[#6B7280]">Administrator</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={() => logout()}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1E40AF] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1C3A8A]"
            >
              <LogOut size={16} /> Logout
            </button>
          )}
        </div>
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between bg-[#EFF6FF] border-t border-[#DBEAFE] px-6 py-2 text-[#374151] md:hidden">
        {links.map(({ path, icon: Icon }) => {
          const selected = activePath === path;
          return (
            <Link key={path} to={path} className={`flex flex-col items-center text-xs ${selected ? 'text-[#1E40AF]' : 'text-[#6B7280]'}`}>
              <Icon size={20} />
              <span>{path === '/dashboard' ? 'Home' : path.slice(1)}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
