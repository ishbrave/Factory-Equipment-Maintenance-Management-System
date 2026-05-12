import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Car,
  ChevronLeft,
  CreditCard,
  FileBarChart2,
  LayoutDashboard,
  LogOut,
  ParkingSquare,
  ReceiptText,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getInitials } from '../../utils/formatters';

const links = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Cars', path: '/cars', icon: Car },
  { label: 'Parking Slots', path: '/slots', icon: ParkingSquare },
  { label: 'Parking Records', path: '/records', icon: ReceiptText },
  { label: 'Payments', path: '/payments', icon: CreditCard },
  { label: 'Reports', path: '/reports', icon: FileBarChart2 },
];

export const Sidebar = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const activePath = location.pathname;
  const initials = useMemo(() => getInitials(user?.username || 'Admin'), [user]);
  const sidebarWidth = collapsed ? 'md:w-20' : 'md:w-60';

  return (
    <div className="flex">
      <aside className={`fixed top-0 left-0 z-10 hidden md:flex md:flex-col md:h-screen ${sidebarWidth} bg-[#EFF6FF] border-r border-[#DBEAFE] transition-all duration-200`}>
        <div className="flex h-20 items-center justify-between px-5">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-[#1E40AF] text-white">
                <ParkingSquare className="h-6 w-6" />
              </div>
              <div>
                <p className="text-lg font-bold text-[#1E40AF]">PSSMS</p>
                <p className="text-xs text-[#6B7280]">SmartPark - Rubavu</p>
              </div>
            </div>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-3xl bg-[#1E40AF] text-white">P</div>
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
          {links.map((item) => {
            const selected = activePath === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 rounded-3xl px-4 py-3 text-sm transition-all duration-200 ${selected ? 'bg-[#1E40AF] text-white border-l-4 border-[#1E40AF]' : 'text-[#374151] hover:bg-[#F0F4FF] hover:text-[#1E40AF]'}`}
              >
                {item.icon ? <item.icon size={18} /> : null}
                {!collapsed && <span>{item.label}</span>}
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
              onClick={logout}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1E40AF] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1C3A8A]"
            >
              <LogOut size={16} /> Logout
            </button>
          )}
        </div>
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between bg-[#EFF6FF] border-t border-[#DBEAFE] px-3 py-2 text-[#374151] md:hidden">
        {links.map((item) => {
          const selected = activePath === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex min-w-[62px] flex-col items-center gap-1 rounded-xl px-1 py-1 text-[11px] ${
                selected ? 'bg-white text-[#1E40AF] shadow-sm' : 'text-[#6B7280]'
              }`}
            >
              {item.icon ? <item.icon size={18} /> : null}
              <span className="leading-tight text-center">
                {item.label === 'Dashboard'
                  ? 'Home'
                  : item.label === 'Parking Slots'
                    ? 'Slots'
                    : item.label === 'Parking Records'
                      ? 'Records'
                      : item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
