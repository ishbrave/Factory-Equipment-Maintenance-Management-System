import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../../api/axios';
import { Layout } from '../../components/layout/Layout';
import { Badge, Loader } from '../../components/common';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const MaintenanceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecord = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/maintenance/${id}`);
        setRecord(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadRecord();
  }, [id]);

  return (
    <Layout title="Maintenance detail">
      {loading ? (
        <Loader fullPage />
      ) : (
        <div className="space-y-6 rounded-[28px] border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <button onClick={() => navigate('/maintenance')} className="inline-flex items-center gap-2 text-sm font-semibold text-[#1E40AF]">
            <ArrowLeft size={18} /> Back to maintenance
          </button>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-[#111827]">{record?.ServiceCode}</h2>
              <p className="text-sm text-[#6B7280]">{record?.Description || 'No description provided.'}</p>
              <div className="space-y-3 rounded-[24px] bg-[#F8FAFC] p-5">
                <div className="flex items-center justify-between text-sm text-[#374151]"><span>Equipment</span><span>{record?.Equipment?.EquipmentName || 'N/A'}</span></div>
                <div className="flex items-center justify-between text-sm text-[#374151]"><span>Technician</span><span>{record?.Technician?.TechnicianName || 'N/A'}</span></div>
                <div className="flex items-center justify-between text-sm text-[#374151]"><span>Date</span><span>{formatDate(record?.ServiceDate)}</span></div>
                <div className="flex items-center justify-between text-sm text-[#374151]"><span>Cost</span><span>{formatCurrency(record?.cost)}</span></div>
                <div className="flex items-center justify-between text-sm text-[#374151]"><span>Service Type</span><span>{record?.ServiceType}</span></div>
                <div className="flex items-center justify-between text-sm text-[#374151]"><span>Next Service</span><span>{record?.NextServiceDate ? formatDate(record.NextServiceDate) : 'Not set'}</span></div>
              </div>
            </div>
            <div className="rounded-[24px] border border-[#E2E8F0] bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-[#111827]">Parts replaced</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {(record?.PartsReplaced || []).length > 0 ? (
                  record.PartsReplaced.map((part) => (
                    <span key={part} className="rounded-full bg-[#DBEAFE] px-3 py-1 text-sm text-[#1E40AF]">{part}</span>
                  ))
                ) : (
                  <p className="text-sm text-[#6B7280]">No parts recorded.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
