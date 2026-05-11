import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import api from '../../api/axios';
import { Layout } from '../../components/layout/Layout';
import { useFetch } from '../../hooks/useFetch';
import { Badge, Button, ConfirmDialog, EmptyState, Loader } from '../../components/common';
import { getInitials } from '../../utils/formatters';

export const TechnicianList = () => {
  const navigate = useNavigate();
  const { data: technicians = [], loading, error } = useFetch('/technicians', { initialData: [] });
  const { data: maintenance = [] } = useFetch('/maintenance', { initialData: [] });
  const [viewMode, setViewMode] = useState('grid');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedTech, setSelectedTech] = useState(null);

  const techniciansArray = Array.isArray(technicians) ? technicians : [];
  const maintenanceArray = Array.isArray(maintenance) ? maintenance : [];

  const technicianJobs = useMemo(() => {
    return techniciansArray.map((tech) => ({
      ...tech,
      jobs: maintenanceArray.filter((record) => record.Technician?.TechnicianName === tech.technicianName).length,
    }));
  }, [techniciansArray, maintenanceArray]);

  const handleDelete = async () => {
    if (!selectedTech) return;
    try {
      await api.delete(`/technicians/${selectedTech._id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setConfirmOpen(false);
      window.location.reload();
    }
  };

  return (
    <Layout title="Technicians">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[#111827]">Technicians</h2>
            <p className="text-sm text-[#6B7280]">Manage your workforce and specializations.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" onClick={() => setViewMode('grid')}>Grid</Button>
            <Button variant="secondary" onClick={() => setViewMode('table')}>Table</Button>
            <Button variant="primary" onClick={() => navigate('/technicians/new')}>
              <Plus size={16} /> Add Technician
            </Button>
          </div>
        </div>

        {loading ? (
          <Loader />
        ) : error ? (
          <EmptyState title="Unable to load technicians" message="There was a problem fetching technicians." />
        ) : viewMode === 'grid' ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {technicianJobs.map((tech) => (
              <div key={tech._id} className="rounded-[28px] border border-[#E2E8F0] bg-white p-6 shadow-sm transition hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#DBEAFE] text-[#1E40AF] text-lg font-semibold">{getInitials(tech.technicianName)}</div>
                  <div>
                    <p className="text-lg font-semibold text-[#111827]">{tech.technicianName}</p>
                    <p className="text-sm text-[#6B7280]">{tech.specialization}</p>
                  </div>
                </div>
                <div className="mt-5 space-y-3 text-sm text-[#4B5563]">
                  <p><span className="font-semibold text-[#111827]">ID:</span> {tech.technicianId}</p>
                  <p><span className="font-semibold text-[#111827]">Email:</span> {tech.email}</p>
                  <p><span className="font-semibold text-[#111827]">Phone:</span> {tech.phone}</p>
                </div>
                <div className="mt-5 flex items-center justify-between gap-3">
                  <Badge variant="primary">{tech.jobs} jobs this month</Badge>
                  <div className="flex items-center gap-2">
                    <button onClick={() => navigate(`/technicians/${tech._id}/edit`)} className="rounded-2xl p-2 text-[#1E40AF] hover:bg-[#DBEAFE]" aria-label="Edit technician"><Pencil size={16} /></button>
                    <button onClick={() => { setSelectedTech(tech); setConfirmOpen(true); }} className="rounded-2xl p-2 text-[#EF4444] hover:bg-[#FEE2E2]" aria-label="Delete technician"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[28px] border border-[#E2E8F0] bg-white p-4 shadow-sm">
            <table className="min-w-full text-left text-sm text-[#374151]">
              <thead className="bg-[#F8FAFC]"><tr><th className="px-5 py-4 font-semibold">Technician</th><th className="px-5 py-4 font-semibold">Specialization</th><th className="px-5 py-4 font-semibold">Jobs</th><th className="px-5 py-4 font-semibold">Actions</th></tr></thead>
              <tbody>
                {technicianJobs.map((tech) => (
                  <tr key={tech._id} className="border-t border-[#E2E8F0] hover:bg-[#F8FAFC]">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#111827]">{tech.technicianName}</p>
                      <p className="text-sm text-[#6B7280]">{tech.technicianId}</p>
                    </td>
                    <td className="px-5 py-4">{tech.specialization}</td>
                    <td className="px-5 py-4">{tech.jobs}</td>
                    <td className="px-5 py-4"><div className="flex gap-2"><button onClick={() => navigate(`/technicians/${tech._id}/edit`)} className="rounded-2xl p-2 text-[#1E40AF] hover:bg-[#DBEAFE]"><Pencil size={16} /></button><button onClick={() => { setSelectedTech(tech); setConfirmOpen(true); }} className="rounded-2xl p-2 text-[#EF4444] hover:bg-[#FEE2E2]"><Trash2 size={16} /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <ConfirmDialog
          isOpen={confirmOpen}
          title="Delete technician"
          message={`Are you sure you want to remove ${selectedTech?.technicianName}?`}
          onConfirm={handleDelete}
          onCancel={() => setConfirmOpen(false)}
          isDangerous
        />
      </div>
    </Layout>
  );
};
