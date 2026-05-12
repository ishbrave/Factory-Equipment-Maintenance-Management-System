export const formatDate = (dateString) => {
  if (!dateString) return '-';

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '-';

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/** Rwandan Franc — explicit "RWF" label (avoids narrow-symbol "RF" from Intl in some environments) */
export const formatCurrency = (value) => {
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    return '0 RWF';
  }
  const num = Number(value);
  const formatted = new Intl.NumberFormat('en-RW', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
  return `${formatted} RWF`;
};

/** Display slot as fixed label P-001 … P-999 */
export const formatSlotLabel = (slotNumber) => {
  const n = Number(slotNumber);
  if (!Number.isInteger(n) || n < 1) return '-';
  return `P-${String(n).padStart(3, '0')}`;
};

export const getInitials = (text) => {
  if (!text) return 'AD';

  return text
    .split(' ')
    .map((word) => word[0]?.toUpperCase())
    .slice(0, 2)
    .join('');
};

export const toDateInputValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

export const toDateTimeLocalValue = (value) => {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const pad = (num) => String(num).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};
