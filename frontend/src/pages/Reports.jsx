import { useMemo, useState } from 'react';
import { Download, Printer } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Button, EmptyState, Loader } from '../components/common';
import { useFetch } from '../hooks/useFetch';
import { formatCurrency, formatDate } from '../utils/formatters';

export const Reports = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const { data: maintenance = [], loading: maintenanceLoading } = useFetch('/maintenance', { initialData: [] });
  const { data: equipment = [] } = useFetch('/equipment', { initialData: [] });
  const { data: technicians = [] } = useFetch('/technicians', { initialData: [] });

  const maintenanceArray = Array.isArray(maintenance) ? maintenance : [];

  const filteredRecords = useMemo(() => {
    return maintenanceArray.filter((record) => {
      const date = new Date(record.ServiceDate);
      if (fromDate && date < new Date(fromDate)) return false;
      if (toDate && date > new Date(toDate)) return false;
      return true;
    });
  }, [maintenanceArray, fromDate, toDate]);

  const summary = useMemo(() => {
    const totalCost = filteredRecords.reduce((sum, record) => sum + Number(record.cost || 0), 0);
    const avgCost = filteredRecords.length ? totalCost / filteredRecords.length : 0;
    const equipmentCount = {};
    const technicianCount = {};

    filteredRecords.forEach((record) => {
      const equipmentId = record.Equipment?._id || record.Equipment;
      equipmentCount[equipmentId] = (equipmentCount[equipmentId] || 0) + 1;
      const technicianId = record.Technician?._id || record.Technician;
      technicianCount[technicianId] = (technicianCount[technicianId] || 0) + 1;
    });

    const topEquipmentId = Object.keys(equipmentCount).reduce((a, b) => (equipmentCount[a] > equipmentCount[b] ? a : b), '');
    const topTechnicianId = Object.keys(technicianCount).reduce((a, b) => (technicianCount[a] > technicianCount[b] ? a : b), '');

    return {
      totalCost,
      avgCost,
      mostServiced: equipment.find((item) => item._id === topEquipmentId)?.EquipmentName || 'N/A',
      mostActive: technicians.find((item) => item._id === topTechnicianId)?.TechnicianName || 'N/A',
    };
  }, [filteredRecords, equipment, technicians]);

  const exportCsv = () => {
    const headers = ['Service Code', 'Equipment', 'Technician', 'Date', 'Cost'];
    const rows = filteredRecords.map((record) => [
      record.ServiceCode,
      record.Equipment?.EquipmentName || 'N/A',
      record.Technician?.TechnicianName || 'N/A',
      formatDate(record.ServiceDate),
      record.cost,
    ]);
    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `maintenance-report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout title="Reports">
      <div className="space-y-6">
        <div className="rounded-[28px] border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6B7280]">Reports</p>
              <h2 className="text-2xl font-bold text-[#111827]">Maintenance analytics</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={exportCsv}>
                <Download size={16} /> Export CSV
              </Button>
              <Button onClick={() => window.print()}>
                <Printer size={16} /> Print Report
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] border border-[#E2E8F0] bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6B7280]">Date range</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-[#374151]">
                From Date
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 focus:border-[#1E40AF] focus:ring-2 focus:ring-[#DBEAFE]"
                />
              </label>
              <label className="space-y-2 text-sm text-[#374151]">
                To Date
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 focus:border-[#1E40AF] focus:ring-2 focus:ring-[#DBEAFE]"
                />
              </label>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-[28px] border border-[#E2E8F0] bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6B7280]">Total Cost</p>
              <p className="mt-4 text-3xl font-semibold text-[#111827]">{formatCurrency(summary.totalCost)}</p>
            </div>
            <div className="rounded-[28px] border border-[#E2E8F0] bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6B7280]">Average Cost</p>
              <p className="mt-4 text-3xl font-semibold text-[#111827]">{formatCurrency(summary.avgCost)}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] border border-[#E2E8F0] bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6B7280]">Most serviced equipment</p>
            <p className="mt-4 text-xl font-semibold text-[#111827]">{summary.mostServiced}</p>
          </div>
          <div className="rounded-[28px] border border-[#E2E8F0] bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6B7280]">Most active technician</p>
            <p className="mt-4 text-xl font-semibold text-[#111827]">{summary.mostActive}</p>
          </div>
        </div>

        <div className="rounded-[28px] border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-[#111827]">Maintenance log</h3>
              <p className="text-sm text-[#6B7280]">Filtered records by selected date range</p>
            </div>
            <p className="text-sm text-[#6B7280]">{filteredRecords.length} records</p>
          </div>
          {maintenanceLoading ? (
            <Loader />
          ) : filteredRecords.length === 0 ? (
            <EmptyState title="No records found" message="Adjust the date range to view maintenance history." />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-[#374151]">
                <thead className="bg-[#F8FAFC]">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Service</th>
                    <th className="px-5 py-4 font-semibold">Equipment</th>
                    <th className="px-5 py-4 font-semibold">Technician</th>
                    <th className="px-5 py-4 font-semibold">Date</th>
                    <th className="px-5 py-4 font-semibold">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr key={record._id} className="border-t border-[#E2E8F0] hover:bg-[#F8FAFC]">
                      <td className="px-5 py-4 font-medium text-[#111827]">{record.ServiceCode}</td>
                      <td className="px-5 py-4">{record.Equipment?.EquipmentName || 'N/A'}</td>
                      <td className="px-5 py-4">{record.Technician?.TechnicianName || 'N/A'}</td>
                      <td className="px-5 py-4">{formatDate(record.ServiceDate)}</td>
                      <td className="px-5 py-4">{formatCurrency(record.cost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
