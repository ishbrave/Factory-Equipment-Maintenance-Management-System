import { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, FileSpreadsheet, FileText, Receipt } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../api/axios';
import { Layout } from '../components/layout/Layout';
import { Button, EmptyState, Loader, Table } from '../components/common';
import { useToast } from '../hooks/useToast';
import { formatCurrency, formatDate, formatDateTime, toDateInputValue } from '../utils/formatters';

const csvEscape = (val) => {
  const s = val == null ? '' : String(val);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

const buildDetailedRows = (payments) =>
  payments.map((p) => ({
    paymentId: p.paymentId,
    recordId: p.recordId,
    plateNumber: p.car?.plateNumber ?? '-',
    driverName: p.car?.driverName ?? '-',
    phoneNumber: p.car?.phoneNumber ?? '-',
    slotLabel: p.slot?.slotNumber != null ? `P-${String(p.slot.slotNumber).padStart(3, '0')}` : '-',
    entryTime: p.record?.entryTime,
    exitTime: p.record?.exitTime,
    duration: p.record?.duration,
    amountPaid: p.amountPaid,
    paymentDate: p.paymentDate,
  }));

export const Reports = () => {
  const { showError, showSuccess } = useToast();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rangeStart, setRangeStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return toDateInputValue(d);
  });
  const [rangeEnd, setRangeEnd] = useState(toDateInputValue(new Date()));

  const loadPayments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/payments');
      setPayments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to load payments.');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const filteredRows = useMemo(() => {
    const start = rangeStart ? new Date(`${rangeStart}T00:00:00`) : null;
    const end = rangeEnd ? new Date(`${rangeEnd}T23:59:59.999`) : null;
    const base = buildDetailedRows(payments);
    return base.filter((row) => {
      const pd = row.paymentDate ? new Date(row.paymentDate) : null;
      if (!pd || Number.isNaN(pd.getTime())) return false;
      if (start && pd < start) return false;
      if (end && pd > end) return false;
      return true;
    });
  }, [payments, rangeStart, rangeEnd]);

  const billRows = useMemo(
    () =>
      filteredRows.map((r) => ({
        plateNumber: r.plateNumber,
        entryTime: r.entryTime,
        exitTime: r.exitTime,
        duration: r.duration,
        amountPaid: r.amountPaid,
        paymentDate: r.paymentDate,
      })),
    [filteredRows]
  );

  const summary = useMemo(() => {
    const totalAmount = filteredRows.reduce((s, r) => s + (Number(r.amountPaid) || 0), 0);
    const totalHours = filteredRows.reduce((s, r) => {
      const d = Number(r.duration);
      return s + (Number.isFinite(d) ? d : 0);
    }, 0);
    return {
      count: filteredRows.length,
      totalAmount,
      totalHours,
    };
  }, [filteredRows]);

  const billColumns = useMemo(
    () => [
      { key: 'plateNumber', label: 'Plate' },
      { key: 'entryTime', label: 'Entry', render: (row) => formatDateTime(row.entryTime) },
      { key: 'exitTime', label: 'Exit', render: (row) => formatDateTime(row.exitTime) },
      { key: 'duration', label: 'Duration (hrs)', render: (row) => (row.duration != null ? row.duration : '-') },
      { key: 'amountPaid', label: 'Amount', render: (row) => formatCurrency(row.amountPaid) },
      { key: 'paymentDate', label: 'Paid on', render: (row) => formatDate(row.paymentDate) },
    ],
    []
  );

  const detailColumns = useMemo(
    () => [
      { key: 'paymentId', label: 'Pay #' },
      { key: 'recordId', label: 'Rec #' },
      { key: 'plateNumber', label: 'Plate' },
      { key: 'driverName', label: 'Driver' },
      { key: 'phoneNumber', label: 'Phone' },
      { key: 'slotLabel', label: 'Slot' },
      { key: 'entryTime', label: 'Entry', render: (r) => formatDateTime(r.entryTime) },
      { key: 'exitTime', label: 'Exit', render: (r) => formatDateTime(r.exitTime) },
      { key: 'duration', label: 'Hrs', render: (r) => r.duration ?? '-' },
      { key: 'amountPaid', label: 'Amount', render: (r) => formatCurrency(r.amountPaid) },
      { key: 'paymentDate', label: 'Paid', render: (r) => formatDate(r.paymentDate) },
    ],
    []
  );

  const downloadCsv = () => {
    const headers = [
      'PaymentID',
      'RecordID',
      'PlateNumber',
      'DriverName',
      'PhoneNumber',
      'Slot',
      'EntryTime',
      'ExitTime',
      'DurationHours',
      'AmountPaid_RWF',
      'PaymentDate',
    ];
    const lines = [headers.join(',')];
    filteredRows.forEach((r) => {
      lines.push(
        [
          csvEscape(r.paymentId),
          csvEscape(r.recordId),
          csvEscape(r.plateNumber),
          csvEscape(r.driverName),
          csvEscape(r.phoneNumber),
          csvEscape(r.slotLabel),
          csvEscape(r.entryTime ? new Date(r.entryTime).toISOString() : ''),
          csvEscape(r.exitTime ? new Date(r.exitTime).toISOString() : ''),
          csvEscape(r.duration),
          csvEscape(r.amountPaid),
          csvEscape(r.paymentDate ? new Date(r.paymentDate).toISOString().slice(0, 10) : ''),
        ].join(',')
      );
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PSSMS_report_${rangeStart}_to_${rangeEnd}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showSuccess('CSV downloaded.');
  };

  const downloadPdf = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(16);
    doc.text('SmartPark PSSMS — Detailed payment report', 14, 16);
    doc.setFontSize(10);
    doc.text(`Period: ${rangeStart} to ${rangeEnd}`, 14, 24);
    doc.text(`Transactions: ${summary.count}   Total: ${formatCurrency(summary.totalAmount)}`, 14, 30);

    const body = filteredRows.map((r) => [
      r.paymentId,
      r.recordId,
      r.plateNumber,
      r.driverName,
      r.phoneNumber,
      r.slotLabel,
      formatDateTime(r.entryTime),
      formatDateTime(r.exitTime),
      r.duration ?? '-',
      formatCurrency(r.amountPaid),
      formatDate(r.paymentDate),
    ]);

    autoTable(doc, {
      startY: 36,
      head: [['Pay#', 'Rec#', 'Plate', 'Driver', 'Phone', 'Slot', 'Entry', 'Exit', 'Hrs', 'Amount', 'Paid']],
      body,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [30, 64, 175] },
    });

    doc.save(`PSSMS_report_${rangeStart}_to_${rangeEnd}.pdf`);
    showSuccess('PDF downloaded.');
  };

  return (
    <Layout title="Reports">
      <div className="space-y-6">
        <div className="rounded-[28px] border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#111827]">Reports &amp; exports</h2>
          <p className="mt-2 text-sm text-[#6B7280]">
            Filter by payment date, review driver-friendly bills, then export a detailed ledger as CSV or PDF.
          </p>
        </div>

        <div className="rounded-[28px] border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[#111827]">Report period</h3>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
            <label className="text-sm text-[#374151]">
              From
              <input
                type="date"
                value={rangeStart}
                onChange={(e) => setRangeStart(e.target.value)}
                className="mt-2 block rounded-[16px] border border-[#E2E8F0] bg-white px-4 py-3 text-sm outline-none focus:border-[#1E40AF] focus:ring-2 focus:ring-[#DBEAFE]"
              />
            </label>
            <label className="text-sm text-[#374151]">
              To
              <input
                type="date"
                value={rangeEnd}
                onChange={(e) => setRangeEnd(e.target.value)}
                className="mt-2 block rounded-[16px] border border-[#E2E8F0] bg-white px-4 py-3 text-sm outline-none focus:border-[#1E40AF] focus:ring-2 focus:ring-[#DBEAFE]"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={downloadCsv} disabled={loading || filteredRows.length === 0}>
                <FileSpreadsheet size={16} /> Download CSV
              </Button>
              <Button type="button" variant="secondary" onClick={downloadPdf} disabled={loading || filteredRows.length === 0}>
                <FileText size={16} /> Download PDF
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-[28px] border border-[#DBEAFE] bg-[#EFF6FF] p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#1E40AF]">Summary</p>
            <p className="mt-3 text-3xl font-bold text-[#111827]">{summary.count}</p>
            <p className="text-sm text-[#6B7280]">Payments in range</p>
          </div>
          <div className="rounded-[28px] border border-[#E2E8F0] bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Total revenue</p>
            <p className="mt-3 text-2xl font-bold text-[#111827]">{formatCurrency(summary.totalAmount)}</p>
            <p className="text-sm text-[#6B7280]">Sum of amount paid</p>
          </div>
          <div className="rounded-[28px] border border-[#E2E8F0] bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Parking hours</p>
            <p className="mt-3 text-2xl font-bold text-[#111827]">
              {Number.isFinite(summary.totalHours) ? summary.totalHours.toFixed(2) : '0.00'}
            </p>
            <p className="text-sm text-[#6B7280]">Sum of billed duration</p>
          </div>
        </div>

        <div className="rounded-[28px] border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Receipt className="text-[#1E40AF]" size={22} />
            <div>
              <h3 className="text-xl font-semibold text-[#111827]">Driver bill view</h3>
              <p className="text-sm text-[#6B7280]">Compact receipt-style lines (plate, times, duration, amount, date).</p>
            </div>
          </div>
          {loading ? (
            <Loader />
          ) : billRows.length === 0 ? (
            <EmptyState title="No bills in this range" message="Adjust dates or record payments to see bills here." />
          ) : (
            <Table columns={billColumns} data={billRows} loading={false} emptyMessage="No data." />
          )}
        </div>

        <div className="rounded-[28px] border-2 border-[#1E40AF]/20 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Download className="text-[#1E40AF]" size={22} />
              <div>
                <h3 className="text-xl font-semibold text-[#111827]">Detailed ledger</h3>
                <p className="text-sm text-[#6B7280]">
                  Full transaction detail including driver, phone, and slot code — use CSV/PDF above to export.
                </p>
              </div>
            </div>
          </div>
          {loading ? (
            <Loader />
          ) : filteredRows.length === 0 ? (
            <EmptyState title="No detailed rows" message="No payments in the selected date range." />
          ) : (
            <Table columns={detailColumns} data={filteredRows} loading={false} emptyMessage="No data." />
          )}
        </div>
      </div>
    </Layout>
  );
};
