import { useCallback, useEffect, useMemo, useState } from 'react';
import { ParkingSquare, Pencil, Plus, Trash2, XCircle } from 'lucide-react';
import api from '../../api/axios';
import { Layout } from '../../components/layout/Layout';
import { Badge, Button, EmptyState, Input, Loader, Table } from '../../components/common';
import { useToast } from '../../hooks/useToast';
import { SLOT_STATUS_OPTIONS } from '../../utils/constants';
import { formatSlotLabel } from '../../utils/formatters';
import { validateSlotNumber } from '../../utils/validation';

export const ParkingSlotPage = () => {
  const { showError, showSuccess } = useToast();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingNum, setDeletingNum] = useState(null);
  const [editingSlotNumber, setEditingSlotNumber] = useState(null);

  const [slotNumber, setSlotNumber] = useState('');
  const [slotStatus, setSlotStatus] = useState('Available');
  const [errors, setErrors] = useState({});

  const loadSlots = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/slots');
      setSlots(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to load parking slots.');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  const resetForm = () => {
    setEditingSlotNumber(null);
    setSlotNumber('');
    setSlotStatus('Available');
    setErrors({});
  };

  const validate = () => {
    const next = {};
    if (!editingSlotNumber) {
      const s = validateSlotNumber(slotNumber);
      if (!s.ok) next.slotNumber = s.message;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      if (editingSlotNumber !== null) {
        await api.put(`/slots/${editingSlotNumber}`, { slotStatus });
        showSuccess('Slot updated successfully.');
      } else {
        const s = validateSlotNumber(slotNumber);
        await api.post('/slots', {
          slotNumber: s.slotNumber,
          slotStatus,
        });
        showSuccess('Parking slot added successfully.');
      }
      resetForm();
      await loadSlots();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to save parking slot.');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (slot) => {
    setEditingSlotNumber(slot.slotNumber);
    setSlotNumber(String(slot.slotNumber));
    setSlotStatus(slot.slotStatus || 'Available');
    setErrors({});
  };

  const handleDelete = async (num) => {
    setDeletingNum(num);
    try {
      await api.delete(`/slots/${num}`);
      showSuccess('Slot deleted successfully.');
      if (editingSlotNumber === num) resetForm();
      await loadSlots();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to delete slot.');
    } finally {
      setDeletingNum(null);
    }
  };

  const columns = useMemo(
    () => [
      { key: 'slotLabel', label: 'Slot', render: (row) => formatSlotLabel(row.slotNumber) },
      { key: 'slotNumber', label: 'Slot #', render: (row) => row.slotNumber },
      {
        key: 'slotStatus',
        label: 'Status',
        render: (row) => <Badge variant={row.slotStatus === 'Available' ? 'success' : 'warning'}>{row.slotStatus}</Badge>,
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
              aria-label="Edit slot"
              disabled={Boolean(deletingNum) || saving}
            >
              <Pencil size={16} />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(row.slotNumber)}
              className="rounded-2xl p-2 text-[#EF4444] hover:bg-[#FEE2E2]"
              aria-label="Delete slot"
              disabled={deletingNum === row.slotNumber || saving}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
      },
    ],
    [deletingNum, saving, editingSlotNumber]
  );

  return (
    <Layout title="Parking slots">
      <div className="space-y-6">
        <div className="rounded-[28px] border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DBEAFE] text-[#1E40AF]">
                <ParkingSquare size={22} />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-[#111827]">{editingSlotNumber !== null ? 'Edit slot' : 'Add slot'}</h2>
                <p className="text-sm text-[#6B7280]">Slots use numeric codes 1–999 (displayed as P-001 … P-999).</p>
              </div>
            </div>
            {editingSlotNumber !== null && (
              <Button type="button" variant="secondary" onClick={resetForm}>
                <XCircle size={16} /> Cancel
              </Button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <Input
                label="Slot number (1–999)"
                type="number"
                min="1"
                max="999"
                value={slotNumber}
                onChange={(e) => setSlotNumber(e.target.value)}
                required={editingSlotNumber === null}
                error={errors.slotNumber}
                disabled={editingSlotNumber !== null}
                placeholder="e.g. 12 → P-012"
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-[#374151]">
                  Slot status <span className="text-[#EF4444]">*</span>
                </label>
                <select
                  value={slotStatus}
                  onChange={(e) => setSlotStatus(e.target.value)}
                  className="w-full rounded-[16px] border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#1E40AF] focus:ring-2 focus:ring-[#DBEAFE]"
                >
                  {SLOT_STATUS_OPTIONS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={saving || Boolean(deletingNum)}>
                <Plus size={16} /> {saving ? 'Saving...' : editingSlotNumber !== null ? 'Update slot' : 'Add slot'}
              </Button>
            </div>
          </form>
        </div>

        <div className="rounded-[28px] border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-xl font-semibold text-[#111827]">All parking slots</h3>
          {loading ? (
            <Loader />
          ) : slots.length === 0 ? (
            <EmptyState title="No parking slots yet" message="Add slots to begin tracking parking records." />
          ) : (
            <Table columns={columns} data={slots} loading={loading} emptyMessage="No parking slots found." />
          )}
        </div>
      </div>
    </Layout>
  );
};
