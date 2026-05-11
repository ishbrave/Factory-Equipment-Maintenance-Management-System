import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { Badge, EmptyState, Loader } from '../../components/common';
import api from '../../api/axios';
import { formatDate } from '../../utils/formatters';

export const EquipmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [equipRes, maintenanceRes] = await Promise.all([
          api.get(`/equipment/${id}`),
          api.get('/maintenance'),
        ]);
        setEquipment(equipRes.data);
        setHistory(maintenanceRes.data.filter((item) => item.Equipment?._id === id || item.Equipment === id));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  return (
    <Layout title="Equipment details">
      {loading ? (
        <Loader fullPage />
      ) : (
        <div className="space-y-6">
          <div className="rounded-[28px] border border-[#E2E8F0] bg-white p-6 shadow-sm">
            <button onClick={() => navigate('/equipment')} className="inline-flex items-center gap-2 text-sm font-semibold text-[#1E40AF] mb-6">
              <ArrowLeft size={18} /> Back to equipment
            </button>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-[#111827]">{equipment?.equipmentName}</h2>
                <p className="text-sm text-[#6B7280]">Equipment code: {equipment?.equipmentCode}</p>
                <div className="flex flex-wrap gap-3">
                  <Badge variant={equipment?.status === 'Operational' ? 'success' : equipment?.status === 'Under Maintenance' ? 'warning' : equipment?.status === 'danger'}>{equipment?.status}</Badge>
                </div>
              </div>
              <div className="rounded-[24px] bg-[#F8FAFC] p-5">
                <p className="text-sm text-[#6B7280]">Maintenance count</p>
                <p className="mt-3 text-3xl font-semibold text-[#111827]">{history.length}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-[#E2E8F0] bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-[#111827]">Service history</h3>
            {history.length === 0 ? (
              <EmptyState title="No history" message="There are no maintenance records for this equipment yet." />
            ) : (
              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full text-left text-sm text-[#374151]">
                  <thead className="bg-[#F8FAFC]">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Service Code</th>
                      <th className="px-5 py-4 font-semibold">Technician</th>
                      <th className="px-5 py-4 font-semibold">Date</th>
                      <th className="px-5 py-4 font-semibold">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((record) => (
                      <tr key={record._id} className="border-t border-[#E2E8F0] hover:bg-[#F8FAFC]">
                        <td className="px-5 py-4 font-medium text-[#111827]">{record.ServiceCode}</td>
                        <td className="px-5 py-4">{record.Technician?.TechnicianName || 'N/A'}</td>
                        <td className="px-5 py-4">{formatDate(record.ServiceDate)}</td>
                        <td className="px-5 py-4">RWF {record.cost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};
