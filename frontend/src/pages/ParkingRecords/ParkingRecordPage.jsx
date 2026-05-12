import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import api from '../../api/axios';
import { Layout } from '../../components/layout/Layout';
import { Badge, Button, EmptyState, Loader, Table } from '../../components/common';
import { useToast } from '../../hooks/useToast';
import { formatDateTime, formatSlotLabel, toDateTimeLocalValue } from '../../utils/formatters';
import { validateSlotNumber } from '../../utils/validation';

export const ParkingRecordPage = () => {
  const { showError, showSuccess } = useToast();
  const formRef = useRef(null);
  const getNowLocalValue = useCallback(() => toDateTimeLocalValue(new Date()), []);
  const [cars, setCars] = useState([]);
  const [slots, setSlots] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [plateNumber, setPlateNumber] = useState('');
  const [slotNumber, setSlotNumber] = useState('');
  const [entryTime, setEntryTime] = useState(() => toDateTimeLocalValue(new Date()));
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

  useEffect(() => {
    setEntryTime(getNowLocalValue());
    const timer = setInterval(() => {
      setEntryTime(getNowLocalValue());
    }, 1000);

    return () => clearInterval(timer);
  }, [getNowLocalValue]);

  const resetForm = () => {
    setPlateNumber('');
    setSlotNumber('');
    setEntryTime(getNowLocalValue());
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

  const handleDelete = async (recordId) => {
    setDeletingId(recordId);
    try {
      await api.delete(`/records/${recordId}`);
      showSuccess('Parking record deleted successfully.');
      await loadData();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to delete parking record.');
    } finally {
      setDeletingId(null);
    }
  };

  const availableSlots = useMemo(() => {
    return slots.filter((slot) => slot.slotStatus === 'Available');
  }, [slots]);

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
            onClick={() => handleDelete(Number(row.recordId))}
            className="rounded-2xl p-2 text-[#EF4444] hover:bg-[#FEE2E2]"
            aria-label="Delete record"
            disabled={deletingId === row.recordId || saving}
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
              <p className="text-sm text-[#6B7280]">Record customer entry. Exit time and parking duration will be completed during payment.</p>
            </div>
          </div>

          <form onSubmit={handleCreate} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#374151]">
                  Plate number <span className="text-[#EF4444]">*</span>
                </label>
                <select
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
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
                  readOnly
                  className="w-full cursor-not-allowed rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#111827] outline-none"
                />
                {errors.entryTime && <p className="mt-2 text-sm text-[#DC2626]">{errors.entryTime}</p>}
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving || deletingId !== null}>
                <Plus size={16} />
                {saving ? 'Saving...' : 'Create record'}
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
