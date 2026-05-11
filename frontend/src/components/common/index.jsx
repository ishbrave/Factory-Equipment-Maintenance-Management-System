import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  ...props
}) => {
  const base = 'rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2';
  const variants = {
    primary: 'bg-[#1E40AF] text-white hover:bg-[#1D4ED8] disabled:bg-gray-400',
    secondary: 'bg-white text-[#111827] border border-[#E2E8F0] hover:bg-[#F1F5F9]',
    danger: 'bg-[#EF4444] text-white hover:bg-[#DC2626] disabled:bg-gray-400',
    outline: 'bg-transparent text-[#1E40AF] border border-[#1E40AF] hover:bg-[#DBEAFE]',
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
    full: 'w-full px-4 py-2.5 text-base',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export const Input = ({
  label,
  icon: Icon,
  error,
  className = '',
  required = false,
  ...props
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-[#374151] mb-2">
          {label}
          {required && <span className="text-[#EF4444]"> *</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[#9CA3AF]">
            <Icon size={18} />
          </div>
        )}
        <input
          className={`w-full rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 pl-${Icon ? '11' : '4'} text-sm text-[#111827] transition-all duration-200 focus:border-[#1E40AF] focus:ring-2 focus:ring-[#DBEAFE] ${Icon ? 'pl-11' : ''}`}
          {...props}
        />
      </div>
      {error && <p className="mt-2 text-sm text-[#DC2626]">{error}</p>}
    </div>
  );
};

export const Modal = ({ title, isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#111827]">{title}</h3>
          <button className="text-[#6B7280] hover:text-[#111827]" onClick={onClose} aria-label="Close modal">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
};

export const Badge = ({ children, variant = 'primary', className = '' }) => {
  const styles = {
    primary: 'bg-[#DBEAFE] text-[#1E40AF]',
    success: 'bg-[#DCFCE7] text-[#15803D]',
    warning: 'bg-[#FEF3C7] text-[#B45309]',
    danger: 'bg-[#FEE2E2] text-[#991B1B]',
    gray: 'bg-[#F3F4F6] text-[#4B5563]',
  };
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const StatCard = ({ icon: Icon, label, value, trend, color = '#1E40AF' }) => (
  <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-[#6B7280]">{label}</p>
        <p className="mt-3 text-3xl font-semibold text-[#111827]">{value}</p>
        {trend && <p className="mt-2 text-sm text-[#6B7280]">{trend}</p>}
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: `${color}1A` }}>
        <Icon size={24} color={color} />
      </div>
    </div>
  </div>
);

export const Loader = ({ fullPage = false }) => {
  const loader = (
    <div className="flex items-center justify-center gap-2">
      <span className="h-3 w-3 rounded-full bg-[#1E40AF] animate-bounce"></span>
      <span className="h-3 w-3 rounded-full bg-[#1E40AF] animate-bounce animation-delay-200"></span>
      <span className="h-3 w-3 rounded-full bg-[#1E40AF] animate-bounce animation-delay-400"></span>
    </div>
  );
  if (fullPage) {
    return <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80">{loader}</div>;
  }
  return loader;
};

export const EmptyState = ({ icon: Icon, title, message }) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-[#E2E8F0] bg-white p-10 text-center">
    {Icon && <Icon size={42} className="text-[#9CA3AF]" />}
    <h3 className="text-lg font-semibold text-[#111827]">{title}</h3>
    <p className="max-w-sm text-sm text-[#6B7280]">{message}</p>
  </div>
);

export const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, isDangerous = false }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <h3 className="text-xl font-semibold text-[#111827] mb-3">{title}</h3>
        <p className="text-sm text-[#4B5563] mb-6">{message}</p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onCancel} className="flex-1">Cancel</Button>
          <Button variant={isDangerous ? 'danger' : 'primary'} onClick={onConfirm} className="flex-1">Confirm</Button>
        </div>
      </div>
    </div>
  );
};

export const Table = ({ columns, data, loading, emptyMessage = 'No records found.' }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="h-12 rounded-2xl bg-[#E2E8F0] animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <EmptyState title="No records" message={emptyMessage} />;
  }

  return (
    <div className="overflow-x-auto rounded-3xl border border-[#E2E8F0] bg-white">
      <table className="min-w-full text-left text-sm text-[#374151]">
        <thead className="bg-[#F8FAFC]">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="whitespace-nowrap px-5 py-4 font-semibold">
                {col.label}
              </th>
            ))}
            {columns.some((col) => col.actions) && <th className="px-5 py-4 font-semibold">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-t border-[#E2E8F0] hover:bg-[#F8FAFC]">
              {columns.map((col) => (
                <td key={col.key} className="whitespace-nowrap px-5 py-4 align-top text-sm text-[#4B5563]">
                  {col.render ? col.render(row) : row[col.key] ?? '—'}
                </td>
              ))}
              {columns.some((col) => col.actions) && (
                <td className="px-5 py-4 text-sm text-[#4B5563]">
                  {columns.filter((col) => col.actions).map((col) => col.actions(row))}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
