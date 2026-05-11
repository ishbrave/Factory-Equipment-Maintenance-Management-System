import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../../api/axios';
import { Layout } from '../../components/layout/Layout';
import { Button, Input } from '../../components/common';
import { STATUS_OPTIONS } from '../../utils/constants';
import { useToast } from '../../hooks/useToast';

export const EquipmentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [equipmentCode, setEquipmentCode] = useState('');
  const [equipmentName, setEquipmentName] = useState('');
  const [status, setStatus] = useState('Operational');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    if (!id) return;
    const loadEquipment = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/equipment/${id}`);
        setEquipmentCode(response.data.equipmentCode);
        setEquipmentName(response.data.equipmentName);
        setStatus(response.data.status);
      } catch (err) {
        showError('Unable to load equipment details');
      } finally {
        setLoading(false);
      }
    };
    loadEquipment();
  }, [id]);

  const validate = () => {
    const next = {};
    if (!equipmentCode.trim()) next.equipmentCode = 'Equipment code is required.';
    if (!equipmentName.trim()) next.equipmentName = 'Equipment name is required.';
    if (!status) next.status = 'Status is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submitForm = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (id) {
        await api.put(`/equipment/${id}`, { equipmentCode, equipmentName, status });
        showSuccess('Equipment updated successfully');
      } else {
        await api.post('/equipment', { equipmentCode, equipmentName, status });
        showSuccess('Equipment added successfully');
      }
      navigate('/equipment');
    } catch (err) {
      showError('Unable to save equipment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title={id ? 'Edit Equipment' : 'Add Equipment'}>
      <div className="space-y-6 rounded-[28px] border border-[#E2E8F0] bg-white p-6 shadow-sm">
        <button onClick={() => navigate('/equipment')} className="inline-flex items-center gap-2 text-sm font-semibold text-[#1E40AF]">
          <ArrowLeft size={18} /> Back to equipment
        </button>
        <form onSubmit={submitForm} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <Input
              label="Equipment Code"
              value={equipmentCode}
              onChange={(e) => setEquipmentCode(e.target.value)}
              error={errors.equipmentCode}
              required
            />
            <Input
              label="Equipment Name"
              value={equipmentName}
              onChange={(e) => setEquipmentName(e.target.value)}
              error={errors.equipmentName}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-[16px] border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#1E40AF] focus:ring-2 focus:ring-[#DBEAFE]"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            {errors.status && <p className="mt-2 text-sm text-[#DC2626]">{errors.status}</p>}
          </div>
          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={loading}>
              {loading ? 'Saving...' : id ? 'Update Equipment' : 'Add Equipment'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};
