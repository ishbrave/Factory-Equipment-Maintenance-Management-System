import { useCallback, useEffect, useMemo, useState } from 'react';
import { Car, Pencil, Plus, Trash2, XCircle } from 'lucide-react';
import api from '../../api/axios';
import { Layout } from '../../components/layout/Layout';
import { Button, EmptyState, Input, Loader, Table } from '../../components/common';
import { useToast } from '../../hooks/useToast';
import { validatePersonName, validatePlate, validateRwPhone } from '../../utils/validation';

export const CarPage = () => {
  const { showError, showSuccess } = useToast();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingPlate, setDeletingPlate] = useState(null);
  const [editingPlate, setEditingPlate] = useState(null);

  const [plateNumber, setPlateNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errors, setErrors] = useState({});

  const loadCars = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/cars');
      setCars(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to load cars.');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadCars();
  }, [loadCars]);

  const resetForm = () => {
    setEditingPlate(null);
    setPlateNumber('');
    setDriverName('');
    setPhoneNumber('');
    setErrors({});
  };

  const onPlateChange = (raw) => {
    const upper = String(raw).toUpperCase().replace(/[^A-Z0-9]/g, '');
    setPlateNumber(upper.slice(0, 7));
  };

  const onNameChange = (raw) => {
    const v = String(raw).replace(/[^A-Za-z ]/g, '');
    setDriverName(v);
  };

  const validate = () => {
    const next = {};
    const p = validatePlate(plateNumber);
    if (!p.ok) next.plateNumber = p.message;
    const n = validatePersonName(driverName);
    if (!n.ok) next.driverName = n.message;
    const ph = validateRwPhone(phoneNumber);
    if (!ph.ok) next.phoneNumber = ph.message;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    const p = validatePlate(plateNumber);
    const n = validatePersonName(driverName);
    const ph = validateRwPhone(phoneNumber);
    if (!p.ok || !n.ok || !ph.ok) return;

    setSaving(true);
    try {
      if (editingPlate) {
        await api.put(`/cars/${encodeURIComponent(editingPlate)}`, {
          plateNumber: p.plate,
          driverName: n.name,
          phoneNumber: ph.phone,
        });
        showSuccess('Car updated successfully.');
      } else {
        await api.post('/cars', {
          plateNumber: p.plate,
          driverName: n.name,
          phoneNumber: ph.phone,
        });
        showSuccess('Car registered successfully.');
      }
      resetForm();
      await loadCars();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to save car.');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (car) => {
    setEditingPlate(car.plateNumber);
    setPlateNumber(car.plateNumber);
    setDriverName(car.driverName || '');
    setPhoneNumber(car.phoneNumber || '');
    setErrors({});
  };

  const handleDelete = async (plate) => {
    setDeletingPlate(plate);
    try {
      await api.delete(`/cars/${encodeURIComponent(plate)}`);
      showSuccess('Car deleted successfully.');
      if (editingPlate === plate) resetForm();
      await loadCars();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to delete car.');
    } finally {
      setDeletingPlate(null);
    }
  };

  const columns = useMemo(
    () => [
      { key: 'plateNumber', label: 'Plate number' },
      { key: 'driverName', label: 'Driver name' },
      { key: 'phoneNumber', label: 'Phone' },
      {
        key: 'actions',
        label: 'Actions',
        actions: (row) => (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => startEdit(row)}
              className="rounded-2xl p-2 text-[#1E40AF] hover:bg-[#DBEAFE]"
              aria-label="Edit car"
              disabled={Boolean(deletingPlate) || saving}
            >
              <Pencil size={16} />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(row.plateNumber)}
              className="rounded-2xl p-2 text-[#EF4444] hover:bg-[#FEE2E2]"
              aria-label="Delete car"
              disabled={deletingPlate === row.plateNumber || saving}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
      },
    ],
    [deletingPlate, saving, editingPlate]
  );

  return (
    <Layout title="Cars">
      <div className="space-y-6">
        <div className="rounded-[28px] border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DBEAFE] text-[#1E40AF]">
                <Car size={22} />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-[#111827]">{editingPlate ? 'Edit car' : 'Car registration'}</h2>
                <p className="text-sm text-[#6B7280]">
                  Rwanda plate format: 3 letters + 3 digits + 1 letter (e.g. RAD123A). Phone: +2507… or 07…
                </p>
              </div>
            </div>
            {editingPlate && (
              <Button type="button" variant="secondary" onClick={resetForm}>
                <XCircle size={16} /> Cancel
              </Button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-3">
              <Input
                label="Plate number"
                value={plateNumber}
                onChange={(e) => onPlateChange(e.target.value)}
                required
                error={errors.plateNumber}
                placeholder="RAD123A"
                autoComplete="off"
              />
              <Input
                label="Driver name"
                value={driverName}
                onChange={(e) => onNameChange(e.target.value)}
                required
                error={errors.driverName}
                placeholder="Jean Bosco"
                autoComplete="name"
              />
              <Input
                label="Phone number"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                error={errors.phoneNumber}
                placeholder="+250788123456"
                autoComplete="tel"
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={saving || Boolean(deletingPlate)}>
                <Plus size={16} /> {saving ? 'Saving...' : editingPlate ? 'Update car' : 'Add car'}
              </Button>
            </div>
          </form>
        </div>

        <div className="rounded-[28px] border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-xl font-semibold text-[#111827]">Registered cars</h3>
          {loading ? (
            <Loader />
          ) : cars.length === 0 ? (
            <EmptyState title="No cars yet" message="Register cars to start parking operations." />
          ) : (
            <Table columns={columns} data={cars} loading={loading} emptyMessage="No cars found." />
          )}
        </div>
      </div>
    </Layout>
  );
};
