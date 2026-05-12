import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pencil, Plus, Trash2, XCircle } from 'lucide-react';
import api from '../../api/axios';
import { Layout } from '../../components/layout/Layout';
import { Badge, Button, EmptyState, Loader, Table } from '../../components/common';
import { useToast } from '../../hooks/useToast';
import { formatDateTime, formatSlotLabel, toDateTimeLocalValue } from '../../utils/formatters';
import { validateSlotNumber } from '../../utils/validation';

export const ParkingRecordPage = () => {
  const { showError, showSuccess } = useToast();
  const formRef = useRef(null);
  const [cars, setCars] = useState([]);
  const [slots, setSlots] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);

  const [plateNumber, setPlateNumber] = useState('');
  const [slotNumber, setSlotNumber] = useState('');
  const [entryTime, setEntryTime] = useState('');
  const [exitTime, setExitTime] = useState('');
  const [errors, setErrors] = useState({});

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [carsResponse, slotsResponse, recordsResponse] = await Promise.all([
        api.get('/cars'),
        api.get('/slots'),
        api.get('/records'),
      ]);

      setCars(Array.isArray(carsResponse.data) ? carsResponse.data : []);
      setSlots(Array.isArray(slotsResponse.data) ? slotsResponse.data : []);
      setRecords(Array.isArray(recordsResponse.data) ? recordsResponse.data : []);
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to load parking record data.');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const resetForm = () => {
    setEditingRecord(null);
    setPlateNumber('');
    setSlotNumber('');
    setEntryTime('');
    setExitTime('');
    setErrors({});
  };

  const validateCreate = () => {
    const next = {};

    if (!plateNumber) next.plateNumber = 'Plate number is required.';
    if (!slotNumber) next.slotNumber = 'Slot is required.';
    else {
      const s = validateSlotNumber(slotNumber);
      if (!s.ok) next.slotNumber = s.message;
    }
    if (!entryTime) next.entryTime = 'Entry time is required.';

    if (entryTime && exitTime) {
      const start = new Date(entryTime);
      const end = new Date(exitTime);
      if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end.getTime() <= start.getTime()) {
        next.exitTime = 'Exit must be after entry.';
      }
    }

    setErrors(next);
    if (Object.keys(next).length > 0) {
      const first = Object.values(next)[0];
      showError(first);
    }
    return Object.keys(next).length === 0;
  };

  const validateUpdate = () => {
    const next = {};

    if (!exitTime) {
      next.exitTime = 'Exit time is required to complete or update a record.';
    } else {
      const start = new Date(entryTime);
      const end = new Date(exitTime);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        next.exitTime = 'Invalid date/time.';
      } else if (end.getTime() <= start.getTime()) {
        next.exitTime = 'Exit must be after entry.';
      }
    }

    setErrors(next);
    if (Object.keys(next).length > 0) {
      const first = Object.values(next)[0];
      showError(first);
    }
    return Object.keys(next).length === 0;
  };

  const handleCreate = async (event) => {
    event.preventDefault();

    if (!validateCreate()) return;

    setSaving(true);
    try {
      await api.post('/records', {
        plateNumber,
        slotNumber: Number(slotNumber),
        entryTime,
        exitTime: exitTime || undefined,
      });

      showSuccess('Parking record created successfully.');
      resetForm();
      await loadData();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to create parking record.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (event) => {
    event.preventDefault();

    if (!editingRecord) return;
    if (!validateUpdate()) return;

    const recordId = Number(editingRecord.recordId);
    if (!Number.isInteger(recordId) || recordId < 1) {
      showError('Invalid record ID.');
      return;
    }

    setUpdating(true);
    try {
      await api.put(`/records/${recordId}`, {
        exitTime,
      });

      showSuccess('Parking record updated successfully.');
      resetForm();
      await loadData();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to update parking record.');
    } finally {
      setUpdating(false);
    }
  };

  const startEdit = (record) => {
    setEditingRecord(record);
    setPlateNumber(record.plateNumber || '');
    setSlotNumber(String(record.slotNumber ?? ''));
    setEntryTime(toDateTimeLocalValue(record.entryTime));
    setExitTime(record.exitTime ? toDateTimeLocalValue(record.exitTime) : '');
    setErrors({});
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const handleDelete = async (recordId) => {
    setDeletingId(recordId);
    try {
      await api.delete(`/records/${recordId}`);
      showSuccess('Parking record deleted successfully.');
      if (editingRecord?.recordId === recordId) {
        resetForm();
      }
      await loadData();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to delete parking record.');
    } finally {
      setDeletingId(null);
    }
  };

  const availableSlots = useMemo(() => {
    return slots.filter((slot) => {
      if (editingRecord && Number(slot.slotNumber) === Number(slotNumber)) return true;
      return slot.slotStatus === 'Available';
    });
  }, [slots, editingRecord, slotNumber]);

  const columns = [
    { key: 'recordId', label: 'Record ID' },
    { key: 'plateNumber', label: 'Plate' },
    { key: 'driverName', label: 'Driver', render: (row) => row.car?.driverName || '-' },
    {
      key: 'slot',
      label: 'Slot',
      render: (row) => formatSlotLabel(row.slotNumber),
    },
    { key: 'entryTime', label: 'Entry', render: (row) => formatDateTime(row.entryTime) },
    { key: 'exitTime', label: 'Exit', render: (row) => formatDateTime(row.exitTime) },
    { key: 'duration', label: 'Duration (hrs)', render: (row) => row.duration ?? '-' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge variant={row.exitTime ? 'success' : 'warning'}>{row.exitTime ? 'Completed' : 'Active'}</Badge>,
    },
    {
      key: 'actions',
      label: 'Actions',
      actions: (row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => startEdit(row)}
            className="rounded-2xl p-2 text-[#1E40AF] hover:bg-[#DBEAFE]"
            aria-label="Edit record"
            disabled={Boolean(deletingId) || saving || updating}
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(Number(row.recordId))}
            className="rounded-2xl p-2 text-[#EF4444] hover:bg-[#FEE2E2]"
            aria-label="Delete record"
            disabled={deletingId === row.recordId || saving || updating}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <Layout title="Parking records">
      <div className="space-y-6">
        <div ref={formRef} className="rounded-[28px] border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-[#111827]">Parking record</h2>
              <p className="text-sm text-[#6B7280]">Record entry; use edit to set or correct exit time and billing duration.</p>
            </div>
            {editingRecord && (
              <Button type="button" variant="secondary" onClick={resetForm}>
                <XCircle size={16} /> Cancel update
              </Button>
            )}
          </div>

          <form onSubmit={editingRecord ? handleUpdate : handleCreate} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#374151]">
                  Plate number <span className="text-[#EF4444]">*</span>
                </label>
                <select
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  disabled={Boolean(editingRecord)}
                  className="w-full rounded-[16px] border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#1E40AF] focus:ring-2 focus:ring-[#DBEAFE] disabled:bg-[#F8FAFC]"
                >
                  <option value="">Select plate</option>
                  {cars.map((car) => (
                    <option key={car.plateNumber} value={car.plateNumber}>
                      {car.plateNumber}
                    </option>
                  ))}
                </select>
                {errors.plateNumber && <p className="mt-2 text-sm text-[#DC2626]">{errors.plateNumber}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#374151]">
                  Slot <span className="text-[#EF4444]">*</span>
                </label>
                <select
                  value={slotNumber}
                  onChange={(e) => setSlotNumber(e.target.value)}
                  disabled={Boolean(editingRecord)}
                  className="w-full rounded-[16px] border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#1E40AF] focus:ring-2 focus:ring-[#DBEAFE] disabled:bg-[#F8FAFC]"
                >
                  <option value="">Select slot</option>
                  {availableSlots.map((slot) => (
                    <option key={slot.slotNumber} value={slot.slotNumber}>
                      {formatSlotLabel(slot.slotNumber)} ({slot.slotStatus})
                    </option>
                  ))}
                </select>
                {errors.slotNumber && <p className="mt-2 text-sm text-[#DC2626]">{errors.slotNumber}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#374151]">
                  Entry <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={entryTime}
                  onChange={(e) => setEntryTime(e.target.value)}
                  disabled={Boolean(editingRecord)}
                  className="w-full rounded-[16px] border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#1E40AF] focus:ring-2 focus:ring-[#DBEAFE] disabled:bg-[#F8FAFC]"
                />
                {errors.entryTime && <p className="mt-2 text-sm text-[#DC2626]">{errors.entryTime}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#374151]">Exit</label>
                <input
                  type="datetime-local"
                  value={exitTime}
                  onChange={(e) => setExitTime(e.target.value)}
                  className="w-full rounded-[16px] border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#1E40AF] focus:ring-2 focus:ring-[#DBEAFE]"
                />
                {errors.exitTime && <p className="mt-2 text-sm text-[#DC2626]">{errors.exitTime}</p>}
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving || updating || deletingId !== null}>
                <Plus size={16} />
                {editingRecord ? (updating ? 'Updating...' : `Update record #${editingRecord.recordId}`) : saving ? 'Saving...' : 'Create record'}
              </Button>
            </div>
          </form>
        </div>

        <div className="rounded-[28px] border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-xl font-semibold text-[#111827]">All parking records</h3>
          {loading ? (
            <Loader />
          ) : records.length === 0 ? (
            <EmptyState title="No records yet" message="Create a parking record when a car enters a slot." />
          ) : (
            <Table columns={columns} data={records} loading={loading} emptyMessage="No parking records found." />
          )}
        </div>
      </div>
    </Layout>
  );
};
