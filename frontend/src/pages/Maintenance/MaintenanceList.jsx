import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../../api/axios';
import { Layout } from '../../components/layout/Layout';
import { useFetch } from '../../hooks/useFetch';
import { Badge, Button, ConfirmDialog, EmptyState, Loader, Table } from '../../components/common';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const MaintenanceList = () => {
  const navigate = useNavigate();
  const { data: maintenance = [], loading, error } = useFetch('/maintenance', { initialData: [] });
  const { data: equipment = [] } = useFetch('/equipment', { initialData: [] });
  const { data: technicians = [] } = useFetch('/technicians', { initialData: [] });

  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [equipmentFilter, setEquipmentFilter] = useState('');
  const [technicianFilter, setTechnicianFilter] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const columns = [
    { key: 'ServiceCode', label: 'Service Code' },
    { key: 'Equipment', label: 'Equipment', render: (row) => row.Equipment?.EquipmentName || 'N/A' },
    { key: 'Technician', label: 'Technician', render: (row) => row.Technician?.TechnicianName || 'N/A' },
    { key: 'ServiceDate', label: 'Date', render: (row) => formatDate(row.ServiceDate) },
    { key: 'cost', label: 'Cost', render: (row) => formatCurrency(row.cost) },
    { key: 'ServiceType', label: 'Service Type', render: (row) => <Badge variant={row.ServiceType === 'Emergency' ? 'danger' : row.ServiceType === 'Corrective' ? 'warning' : 'success'}>{row.ServiceType}</Badge> },
    { key: 'actions', label: 'Actions', actions: (row) => (
      <div className="flex items-center gap-2">
        <button onClick={() => navigate(`/maintenance/${row._id}/edit`)} className="rounded-2xl p-2 text-[#1E40AF] hover:bg-[#DBEAFE]" aria-label="Edit maintenance">
          <Pencil size={16} />
        </button>
        <button onClick={() => { setSelected(row); setConfirmOpen(true); }} className="rounded-2xl p-2 text-[#EF4444] hover:bg-[#FEE2E2]" aria-label="Delete maintenance">
          <Trash2 size={16} />
        </button>
      </div>
    )},
  ];

  const filteredData = useMemo(() => {
    return maintenance.filter((item) => {
      const itemDate = new Date(item.ServiceDate);
      if (startDate && itemDate < startDate) return false;
      if (endDate && itemDate > endDate) return false;
      if (equipmentFilter && item.Equipment?.EquipmentName !== equipmentFilter) return false;
      if (technicianFilter && item.Technician?.TechnicianName !== technicianFilter) return false;
      return true;
    });
  }, [maintenance, startDate, endDate, equipmentFilter, technicianFilter]);

  const handleDelete = async () => {
    if (!selected) return;
    try {
      await api.delete(`/maintenance/${selected._id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setConfirmOpen(false);
      window.location.reload();
    }
  };

  return (
    <Layout title="Maintenance">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[#111827]">Maintenance</h2>
            <p className="text-sm text-[#6B7280]">Track repairs and service history.</p>
          </div>
          <Button variant="primary" onClick={() => navigate('/maintenance/new')}>
            <Plus size={16} /> Add Maintenance Record
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
          <div className="rounded-[24px] border border-[#E2E8F0] bg-white p-4">
            <p className="text-sm font-semibold text-[#6B7280]">Date range</p>
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={(update) => setDateRange(update)}
              className="mt-3 w-full rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#111827] outline-none"
              placeholderText="Select a range"
            />
          </div>
          <div className="grid gap-4">
            <label className="rounded-[24px] border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#374151]">
              Equipment
              <select className="mt-2 w-full bg-transparent text-sm outline-none" value={equipmentFilter} onChange={(e) => setEquipmentFilter(e.target.value)}>
                <option value="">All equipment</option>
                {equipment.map((item) => (
                  <option key={item._id} value={item.equipmentName}>{item.equipmentName}</option>
                ))}
              </select>
            </label>
            <label className="rounded-[24px] border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#374151]">
              Technician
              <select className="mt-2 w-full bg-transparent text-sm outline-none" value={technicianFilter} onChange={(e) => setTechnicianFilter(e.target.value)}>
                <option value="">All technicians</option>
                {technicians.map((item) => (
                  <option key={item._id} value={item.technicianName}>{item.technicianName}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {loading ? (
          <Loader />
        ) : error ? (
          <EmptyState title="Unable to load maintenance" message="There was a problem loading maintenance history." />
        ) : (
          <Table columns={columns} data={filteredData} emptyMessage="No maintenance records match your filters." />
        )}

        <ConfirmDialog
          isOpen={confirmOpen}
          title="Delete maintenance record"
          message={`Are you sure you want to delete record ${selected?.ServiceCode}?`}
          onConfirm={handleDelete}
          onCancel={() => setConfirmOpen(false)}
          isDangerous
        />
      </div>
    </Layout>
  );
};
