import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Pencil, Trash2 } from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { useFetch } from '../../hooks/useFetch';
import { Badge, Button, ConfirmDialog, EmptyState, Loader, Table } from '../../components/common';
import { formatDate } from '../../utils/formatters';
import { STATUS_OPTIONS } from '../../utils/constants';

export const EquipmentList = () => {
  const navigate = useNavigate();
  const { data: equipment = [], loading, error } = useFetch('/equipment', { initialData: [] });
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);

  const equipmentArray = Array.isArray(equipment) ? equipment : [];

  const filtered = useMemo(() => {
    return equipmentArray.filter((item) => {
      const matchesQuery = [item.equipmentCode, item.equipmentName].some((value) => value?.toLowerCase().includes(query.toLowerCase()));
      const matchesStatus = statusFilter ? item.status === statusFilter : true;
      return matchesQuery && matchesStatus;
    });
  }, [equipmentArray, query, statusFilter]);

  const columns = [
    { key: 'equipmentCode', label: 'Code' },
    { key: 'equipmentName', label: 'Name' },
    { key: 'status', label: 'Status', render: (row) => {
      const color = row.status === 'Operational' ? 'success' : row.status === 'Under Maintenance' ? 'warning' : row.status === 'Out of Service' ? 'danger' : 'gray';
      return <Badge variant={color}>{row.status}</Badge>;
    }},
    { key: 'maintenanceCount', label: 'Maintenance Count' },
    { key: 'lastServiceDate', label: 'Last Service', render: (row) => formatDate(row.lastServiceDate) },
    { key: 'actions', label: 'Actions', actions: (row) => (
      <div className="flex items-center gap-2">
        <button onClick={() => navigate(`/equipment/${row._id}`)} className="rounded-2xl p-2 text-[#1E40AF] hover:bg-[#DBEAFE]" aria-label="View equipment">
          <Eye size={16} />
        </button>
        <button onClick={() => navigate(`/equipment/${row._id}/edit`)} className="rounded-2xl p-2 text-[#1E40AF] hover:bg-[#DBEAFE]" aria-label="Edit equipment">
          <Pencil size={16} />
        </button>
        <button onClick={() => { setSelectedEquipment(row); setConfirmOpen(true); }} className="rounded-2xl p-2 text-[#EF4444] hover:bg-[#FEE2E2]" aria-label="Delete equipment">
          <Trash2 size={16} />
        </button>
      </div>
    )},
  ];

  const handleDelete = async () => {
    if (!selectedEquipment) return;
    try {
      await fetch(`http://localhost:5000/api/equipment/${selectedEquipment._id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' }});
    } catch (err) {
      console.error(err);
    } finally {
      setSelectedEquipment(null);
      setConfirmOpen(false);
      window.location.reload();
    }
  };

  return (
    <Layout title="Equipment">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[#111827]">Equipment</h2>
            <p className="text-sm text-[#6B7280]">Manage tooling, status, and service history.</p>
          </div>
          <Button variant="primary" onClick={() => navigate('/equipment/new')}>
            <Plus size={16} /> Add Equipment
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="rounded-[20px] border border-[#E2E8F0] bg-white px-4 py-3 flex items-center gap-3">
            <Search size={18} className="text-[#9CA3AF]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or code"
              className="w-full bg-transparent text-sm text-[#374151] outline-none"
            />
          </label>
          <label className="rounded-[20px] border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#374151]">
            Status filter
            <select
              className="mt-2 w-full bg-transparent text-sm outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </label>
        </div>

        {loading ? (
          <Loader />
        ) : error ? (
          <EmptyState title="Unable to load equipment" message="There was a problem fetching the list. Please refresh." />
        ) : (
          <Table columns={columns} data={filtered} emptyMessage="No equipment found." />
        )}

        <ConfirmDialog
          isOpen={confirmOpen}
          title="Delete equipment"
          message={`Are you sure you want to delete ${selectedEquipment?.equipmentName}?`}
          onConfirm={handleDelete}
          onCancel={() => setConfirmOpen(false)}
          isDangerous
        />
      </div>
    </Layout>
  );
};
