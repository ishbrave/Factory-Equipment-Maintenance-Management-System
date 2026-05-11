import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../../api/axios';
import { Layout } from '../../components/layout/Layout';
import { Button, Input } from '../../components/common';
import { TECH_SPECIALTIES } from '../../utils/constants';
import { useToast } from '../../hooks/useToast';

export const TechnicianForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [technicianId, setTechnicianId] = useState('');
  const [technicianName, setTechnicianName] = useState('');
  const [specialization, setSpecialization] = useState('Electrical');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/technicians/${id}`)
      .then((res) => {
        setTechnicianId(res.data.technicianId);
        setTechnicianName(res.data.technicianName);
        setSpecialization(res.data.specialization);
        setPhone(res.data.phone);
        setEmail(res.data.email);
      })
      .catch(() => showError('Unable to load technician details'))
      .finally(() => setLoading(false));
  }, [id]);

  const validate = () => {
    const next = {};
    if (!technicianId.trim()) next.technicianId = 'Technician ID is required.';
    if (!technicianName.trim()) next.technicianName = 'Name is required.';
    if (!phone.trim()) next.phone = 'Phone is required.';
    if (!email.trim()) next.email = 'Email is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (id) {
        await api.put(`/technicians/${id}`, { technicianId, technicianName, specialization, phone, email });
        showSuccess('Technician updated successfully');
      } else {
        await api.post('/technicians', { technicianId, technicianName, specialization, phone, email });
        showSuccess('Technician created successfully');
      }
      navigate('/technicians');
    } catch (err) {
      showError('Unable to save technician.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title={id ? 'Edit Technician' : 'Add Technician'}>
      <div className="space-y-6 rounded-[28px] border border-[#E2E8F0] bg-white p-6 shadow-sm">
        <button onClick={() => navigate('/technicians')} className="inline-flex items-center gap-2 text-sm font-semibold text-[#1E40AF]">
          <ArrowLeft size={18} /> Back to technicians
        </button>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Input label="Technician ID" value={technicianId} onChange={(e) => setTechnicianId(e.target.value)} error={errors.technicianId} required />
            <Input label="Name" value={technicianName} onChange={(e) => setTechnicianName(e.target.value)} error={errors.technicianName} required />
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">Specialization</label>
              <select
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full rounded-[16px] border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#1E40AF] focus:ring-2 focus:ring-[#DBEAFE]"
              >
                {TECH_SPECIALTIES.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} error={errors.phone} required type="tel" />
            <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} required type="email" />
          </div>
          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={loading}>
              {loading ? 'Saving...' : id ? 'Update Technician' : 'Add Technician'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};
