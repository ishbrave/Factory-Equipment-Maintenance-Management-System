import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, CreditCard, ParkingSquare, ReceiptText, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import api from '../api/axios';
import { Layout } from '../components/layout/Layout';
import { Loader, StatCard } from '../components/common';
import { useToast } from '../hooks/useToast';
import { formatCurrency } from '../utils/formatters';

const PIE_COLORS = ['#1E40AF', '#DBEAFE', '#0EA5E9', '#F59E0B'];

export const Dashboard = () => {
  const { showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [cars, setCars] = useState([]);
  const [slots, setSlots] = useState([]);
  const [records, setRecords] = useState([]);
  const [payments, setPayments] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, s, r, p] = await Promise.all([
        api.get('/cars'),
        api.get('/slots'),
        api.get('/records'),
        api.get('/payments'),
      ]);
      setCars(Array.isArray(c.data) ? c.data : []);
      setSlots(Array.isArray(s.data) ? s.data : []);
      setRecords(Array.isArray(r.data) ? r.data : []);
      setPayments(Array.isArray(p.data) ? p.data : []);
    } catch (e) {
      showError(e.response?.data?.message || 'Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    load();
  }, [load]);

  const slotPieData = useMemo(() => {
    const available = slots.filter((x) => x.slotStatus === 'Available').length;
    const occupied = slots.filter((x) => x.slotStatus === 'Occupied').length;
    if (available === 0 && occupied === 0) {
      return [{ name: 'No slots', value: 1 }];
    }
    return [
      { name: 'Available', value: available },
      { name: 'Occupied', value: occupied },
    ];
  }, [slots]);

  const recordPieData = useMemo(() => {
    const active = records.filter((x) => !x.exitTime).length;
    const done = records.filter((x) => Boolean(x.exitTime)).length;
    if (active === 0 && done === 0) {
      return [{ name: 'No records', value: 1 }];
    }
    return [
      { name: 'Active sessions', value: active },
      { name: 'Completed', value: done },
    ];
  }, [records]);

  const revenue = useMemo(() => payments.reduce((sum, x) => sum + (Number(x.amountPaid) || 0), 0), [payments]);

  const quickLinks = [
    { to: '/cars', label: 'Manage cars', icon: Car },
    { to: '/slots', label: 'Parking slots', icon: ParkingSquare },
    { to: '/records', label: 'Parking records', icon: ReceiptText },
    { to: '/payments', label: 'Payments', icon: CreditCard },
  ];

  return (
    <Layout title="Dashboard">
      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader />
        </div>
      ) : (
        <div className="space-y-8">
          <div className="rounded-[28px] border border-[#E2E8F0] bg-gradient-to-br from-[#1E40AF] to-[#1E3A8A] p-8 text-white shadow-lg">
            <p className="text-sm font-medium uppercase tracking-widest text-white/80">System overview</p>
            <h2 className="mt-2 text-3xl font-bold">Welcome to SmartPark PSSMS</h2>
            <p className="mt-3 max-w-2xl text-sm text-white/85">
              Track occupancy, active sessions, and revenue at a glance. Use the sidebar to register cars, manage slots,
              record entries and exits, process payments, and run reports.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={Car} label="Registered cars" value={String(cars.length)} color="#1E40AF" />
            <StatCard icon={ParkingSquare} label="Parking slots" value={String(slots.length)} color="#0EA5E9" />
            <StatCard icon={ReceiptText} label="Total records" value={String(records.length)} color="#8B5CF6" />
            <StatCard icon={TrendingUp} label="Total revenue" value={formatCurrency(revenue)} color="#059669" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[28px] border border-[#E2E8F0] bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-[#111827]">Slot availability</h3>
              <p className="mt-1 text-sm text-[#6B7280]">Share of available vs occupied slots</p>
              <div className="mt-4 h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={slotPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={50} label>
                      {slotPieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-[28px] border border-[#E2E8F0] bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-[#111827]">Parking sessions</h3>
              <p className="mt-1 text-sm text-[#6B7280]">Active vs completed parking records</p>
              <div className="mt-4 h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={recordPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={50} label>
                      {recordPieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[(i + 2) % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-[#E2E8F0] bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#111827]">Quick actions</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {quickLinks.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-4 text-sm font-semibold text-[#1E40AF] transition hover:border-[#1E40AF] hover:bg-white"
                >
                  <item.icon size={20} />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
