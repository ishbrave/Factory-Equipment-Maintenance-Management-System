/** Rwanda private plate: e.g. RAD123A (3 letters + 3 digits + 1 letter), optional spaces */
export const RW_PLATE_REGEX = /^[A-Z]{3}\d{3}[A-Z]$/;

export const normalizePlate = (raw) => String(raw || '').replace(/\s+/g, '').toUpperCase();

export const validatePlate = (raw) => {
  const plate = normalizePlate(raw);
  if (!plate) return { ok: false, message: 'Plate number is required.', plate: '' };
  if (!RW_PLATE_REGEX.test(plate)) {
    return {
      ok: false,
      message: 'Use Rwanda format: 3 letters, 3 digits, 1 letter (e.g. RAD123A).',
      plate,
    };
  }
  return { ok: true, plate };
};

/** Driver name: letters and spaces only (Latin), at least 2 chars */
export const NAME_REGEX = /^[A-Za-z]+(?: [A-Za-z]+)*$/;

export const validatePersonName = (raw) => {
  const name = String(raw || '').trim();
  if (!name) return { ok: false, message: 'Name is required.' };
  if (name.length < 2) return { ok: false, message: 'Name must be at least 2 characters.' };
  if (!NAME_REGEX.test(name)) return { ok: false, message: 'Name must contain letters and spaces only.' };
  return { ok: true, name };
};

export const normalizeRwPhone = (raw) => {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('2507')) return `+${digits}`;
  if (digits.length === 10 && digits.startsWith('07')) return `+250${digits.slice(1)}`;
  if (digits.length === 9 && digits.startsWith('7')) return `+250${digits}`;
  return null;
};

export const validateRwPhone = (raw) => {
  const trimmed = String(raw || '').trim();
  if (!trimmed) return { ok: false, message: 'Phone number is required.' };
  const normalized = normalizeRwPhone(trimmed);
  if (!normalized || normalized.length !== 13) {
    return { ok: false, message: 'Use Rwanda format: +2507XXXXXXXX, 07XXXXXXXX, or 7XXXXXXXX.' };
  }
  return { ok: true, phone: normalized };
};

/** Slot number: positive integer 1–999 (displayed elsewhere as P-###) */
export const validateSlotNumber = (raw) => {
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1 || n > 999) {
    return { ok: false, message: 'Slot must be a whole number from 1 to 999 (format P-001 … P-999).' };
  }
  return { ok: true, slotNumber: n };
};
