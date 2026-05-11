import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ArrowLeft } from 'lucide-react';
import api from '../../api/axios';
import { Layout } from '../../components/layout/Layout';
import { Button, Input } from '../../components/common';
import { SERVICE_TYPES } from '../../utils/constants';
import { useToast } from '../../hooks/useToast';

export const MaintenanceForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [serviceCode, setServiceCode] = useState('');
  const [equipmentId, setEquipmentId] = useState('');
  const [technicianId, setTechnicianId] = useState('');
  const [serviceDate, setServiceDate] = useState(new Date());
  const [nextServiceDate, setNextServiceDate] = useState(null);
  const [cost, setCost] = useState('');
  const [serviceType, setServiceType] = useState('Preventive');
  const [notes, setNotes] = useState('');
  const [parts, setParts] = useState('');
  const [equipment, setEquipment] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    api.get('/equipment').then((res) => setEquipment(res.data)).catch(() => {});
    api.get('/technicians').then((res) => setTechnicians(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/maintenance/${id}`)
      .then((res) => {
        const record = res.data;
        setServiceCode(record.ServiceCode);
        setEquipmentId(record.Equipment?._id || record.Equipment);
        setTechnicianId(record.Technician?._id || record.Technician);
        setServiceDate(new Date(record.ServiceDate));
        setNextServiceDate(record.NextServiceDate ? new Date(record.NextServiceDate) : null);
        setCost(record.cost);
        setServiceType(record.ServiceType);
        setNotes(record.Description || '');
        setParts((record.PartsReplaced || []).join(', '));
      })
      .catch(() => showError('Unable to load maintenance record'))
      .finally(() => setLoading(false));
  }, [id]);

  const validate = () => {
    const next = {};
    if (!serviceCode.trim()) next.serviceCode = 'Service code is required.';
    if (!equipmentId) next.equipmentId = 'Equipment selection is required.';
    if (!technicianId) next.technicianId = 'Technician selection is required.';
    if (!cost || Number(cost) <= 0) next.cost = 'Cost must be greater than zero.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const payload = {
      ServiceCode: serviceCode,
      Equipment: equipmentId,
      Technician: technicianId,
      ServiceDate: serviceDate,
      NextServiceDate: nextServiceDate,
      cost: Number(cost),
      ServiceType: serviceType,
      Description: notes,
      PartsReplaced: parts.split(',').map((item) => item.trim()).filter(Boolean),
    };
    try {
      if (id) {
        await api.put(`/maintenance/${id}`, payload);
        showSuccess('Maintenance record updated.');
      } else {
        await api.post('/maintenance', payload);
        showSuccess('Maintenance record created.');
      }
      navigate('/maintenance');
    } catch (err) {
      showError('Unable to save maintenance record.');
    } finally {
      setLoading(false);
    }
  };

  const equipmentOptions = useMemo(() => equipment, [equipment]);
  const technicianOptions = useMemo(() => technicians, [technicians]);

  return (
    <Layout title={id ? 'Edit Maintenance' : 'Add Maintenance'}>
      <div className="space-y-6 rounded-[28px] border border-[#E2E8F0] bg-white p-6 shadow-sm">
        <button onClick={() => navigate('/maintenance')} className="inline-flex items-center gap-2 text-sm font-semibold text-[#1E40AF]">
          <ArrowLeft size={18} /> Back to maintenance
        </button>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Input label="Service Code" value={serviceCode} onChange={(e) => setServiceCode(e.target.value)} error={errors.serviceCode} required />
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">Equipment</label>
              <select
                value={equipmentId}
                onChange={(e) => setEquipmentId(e.target.value)}
                className="w-full rounded-[16px] border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#1E40AF] focus:ring-2 focus:ring-[#DBEAFE]"
              >
                <option value="">Select equipment</option>
                {equipmentOptions.map((item) => (
                  <option key={item._id} value={item._id}>{item.equipmentName}</option>
                ))}
              </select>
              {errors.equipmentId && <p className="mt-2 text-sm text-[#DC2626]">{errors.equipmentId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">Technician</label>
              <select
                value={technicianId}
                onChange={(e) => setTechnicianId(e.target.value)}
                className="w-full rounded-[16px] border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#1E40AF] focus:ring-2 focus:ring-[#DBEAFE]"
              >
                <option value="">Select technician</option>
                {technicianOptions.map((item) => (
                  <option key={item._id} value={item._id}>{item.technicianName}</option>
                ))}
              </select>
              {errors.technicianId && <p className="mt-2 text-sm text-[#DC2626]">{errors.technicianId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">Service Date</label>
              <DatePicker
                selected={serviceDate}
                onChange={(date) => setServiceDate(date)}
                className="w-full rounded-[16px] border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#1E40AF] focus:ring-2 focus:ring-[#DBEAFE]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">Cost (RWF)</label>
              <Input
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="00"
                error={errors.cost}
                required
                type="number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">Service Type</label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full rounded-[16px] border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#1E40AF] focus:ring-2 focus:ring-[#DBEAFE]"
              >
                {SERVICE_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">Next Service Date</label>
              <DatePicker
                selected={nextServiceDate}
                onChange={(date) => setNextServiceDate(date)}
                className="w-full rounded-[16px] border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#1E40AF] focus:ring-2 focus:ring-[#DBEAFE]"
              />
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-[#374151] mb-2">Description / Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full rounded-[16px] border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#1E40AF] focus:ring-2 focus:ring-[#DBEAFE]"
              />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-[#374151] mb-2">Parts Replaced</label>
              <Input
                value={parts}
                onChange={(e) => setParts(e.target.value)}
                placeholder="Comma separated parts"
              />
              <p className="mt-2 text-xs text-[#6B7280]">Separate with commas and press save.</p>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={loading}>
              {loading ? 'Saving...' : id ? 'Update record' : 'Create record'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};
