import { useMemo } from 'react';
import { Cpu, CheckCircle2, Wrench, Users, ArrowRight } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { Layout } from '../components/layout/Layout';
import { EquipmentPieChart } from '../components/charts/EquipmentPieChart';
import { Badge, EmptyState, Loader, StatCard, Table } from '../components/common';
import { formatCurrency, formatDate, getInitials } from '../utils/formatters';

export const Dashboard = () => {
  const { data: equipment = [], loading: equipmentLoading } = useFetch('/equipment', { initialData: [] });
  const { data: technicians = [], loading: techniciansLoading } = useFetch('/technicians', { initialData: [] });
  const { data: maintenance = [], loading: maintenanceLoading } = useFetch('/maintenance', { initialData: [] });

  const equipmentArray = Array.isArray(equipment) ? equipment : [];
  const techniciansArray = Array.isArray(technicians) ? technicians : [];
  const maintenanceArray = Array.isArray(maintenance) ? maintenance : [];

  const stats = useMemo(() => {
    const totalEquipment = equipmentArray.length;
    const activeEquipment = equipmentArray.filter((item) => item.status === 'Operational').length;
    const totalMaintenance = maintenanceArray.length;
    const totalTechnicians = techniciansArray.length;
    return { totalEquipment, activeEquipment, totalMaintenance, totalTechnicians };
  }, [equipmentArray, maintenanceArray, techniciansArray]);

  const recentRecords = maintenanceArray.slice(0, 5);

  const topTechnicians = useMemo(() => {
    const counts = maintenanceArray.reduce((acc, item) => {
      const name = item.Technician?.TechnicianName || 'Unknown';
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [maintenanceArray]);

  const maintenanceColumns = [
    { key: 'ServiceCode', label: 'Service Code' },
    { key: 'EquipmentName', label: 'Equipment' , render: (row) => row.Equipment?.EquipmentName || '—'},
    { key: 'TechnicianName', label: 'Technician', render: (row) => row.Technician?.TechnicianName || '—' },
    { key: 'ServiceDate', label: 'Date', render: (row) => formatDate(row.ServiceDate) },
    { key: 'cost', label: 'Cost', render: (row) => formatCurrency(row.cost) },
    { key: 'status', label: 'Status', render: (row) => <Badge variant={row.status === 'Pending' ? 'warning' : 'success'}>{row.status}</Badge> },
  ];

  return (
    <Layout title="Dashboard">
      <div className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Cpu} label="Total Equipment" value={stats.totalEquipment} trend="+4 this month" color="#1E40AF" />
          <StatCard icon={CheckCircle2} label="Active Equipment" value={stats.activeEquipment} trend="+2 this month" color="#22C55E" />
          <StatCard icon={Wrench} label="Total Maintenance" value={stats.totalMaintenance} trend="+6 this month" color="#F59E0B" />
          <StatCard icon={Users} label="Total Technicians" value={stats.totalTechnicians} trend="+1 this month" color="#3B82F6" />
        </div>

        <EquipmentPieChart equipment={equipmentArray} />

        <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <div className="rounded-[24px] border border-[#E2E8F0] bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6B7280]">Recent Maintenance Records</p>
                <p className="text-sm text-[#6B7280]">Latest updates across the plant</p>
              </div>
              <span className="text-sm font-semibold text-[#1E40AF]">View All →</span>
            </div>
            <Table columns={maintenanceColumns} data={recentRecords} loading={maintenanceLoading} />
          </div>

          <div className="rounded-[24px] border border-[#E2E8F0] bg-white p-6 shadow-sm">
            <div className="mb-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6B7280]">Top Technicians</p>
              <p className="text-sm text-[#6B7280]">Workload ranking this month</p>
            </div>
            <div className="space-y-4">
              {topTechnicians.length === 0 ? (
                <EmptyState title="No technicians" message="No workload data is available." />
              ) : (
                topTechnicians.map((tech, index) => (
                  <div key={tech.name} className="space-y-3 rounded-3xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-3xl bg-[#DBEAFE] text-[#1E40AF] font-semibold">{getInitials(tech.name)}</div>
                        <div>
                          <p className="font-semibold text-[#111827]">{tech.name}</p>
                          <p className="text-sm text-[#6B7280]">{tech.count} jobs</p>
                        </div>
                      </div>
                      <Badge variant="primary">{tech.count}</Badge>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white">
                      <div className="h-full rounded-full bg-[#3B82F6]" style={{ width: `${Math.min((tech.count / topTechnicians[0].count) * 100, 100)}%` }} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
