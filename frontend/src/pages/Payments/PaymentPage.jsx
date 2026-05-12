import { useCallback, useEffect, useMemo, useState } from 'react';
import { Calculator, Plus } from 'lucide-react';
import api from '../../api/axios';
import { Layout } from '../../components/layout/Layout';
import { Button, EmptyState, Loader, Table } from '../../components/common';
import { useToast } from '../../hooks/useToast';
import { formatCurrency, formatDate, formatDateTime, toDateInputValue } from '../../utils/formatters';

const calculateAmount = (duration) => {
  const numericDuration = Number(duration) || 0;
  return Math.max(500, numericDuration * 500);
};

export const PaymentPage = () => {
  const { showError, showSuccess } = useToast();
  const [records, setRecords] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [recordId, setRecordId] = useState('');
  const [paymentDate, setPaymentDate] = useState(toDateInputValue(new Date()));

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [recordsResponse, paymentsResponse] = await Promise.all([
        api.get('/records'),
        api.get('/payments'),
      ]);

      setRecords(Array.isArray(recordsResponse.data) ? recordsResponse.data : []);
      setPayments(Array.isArray(paymentsResponse.data) ? paymentsResponse.data : []);
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to load payment data.');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const unpaidRecords = useMemo(() => {
    const paidRecordIds = new Set(payments.map((payment) => Number(payment.recordId)));

    return records.filter((record) => record.exitTime && !paidRecordIds.has(Number(record.recordId)));
  }, [records, payments]);

  const selectedRecord = useMemo(
    () => unpaidRecords.find((record) => Number(record.recordId) === Number(recordId)) || null,
    [unpaidRecords, recordId]
  );

  const amountPaid = useMemo(() => {
    if (!selectedRecord) return 0;
    return calculateAmount(selectedRecord.duration);
  }, [selectedRecord]);

  const resetForm = () => {
    setRecordId('');
    setPaymentDate(toDateInputValue(new Date()));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!recordId || !paymentDate) {
      showError('Record and payment date are required.');
      return;
    }

    setSaving(true);
    try {
      await api.post('/payments', {
        recordId: Number(recordId),
        paymentDate,
      });

      showSuccess('Payment recorded successfully.');
      resetForm();
      await loadData();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to create payment.');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'paymentId', label: 'Payment ID' },
    { key: 'recordId', label: 'Record ID' },
    { key: 'plateNumber', label: 'Plate', render: (row) => row.car?.plateNumber || '-' },
    { key: 'entryTime', label: 'Entry', render: (row) => formatDateTime(row.record?.entryTime) },
    { key: 'exitTime', label: 'Exit', render: (row) => formatDateTime(row.record?.exitTime) },
    { key: 'duration', label: 'Duration (hrs)', render: (row) => row.record?.duration ?? '-' },
    { key: 'amountPaid', label: 'Amount', render: (row) => formatCurrency(row.amountPaid) },
    { key: 'paymentDate', label: 'Paid on', render: (row) => formatDate(row.paymentDate) },
  ];

  return (
    <Layout title="Payments">
      <div className="space-y-6">
        <div className="rounded-[28px] border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DBEAFE] text-[#1E40AF]">
                <Calculator size={22} />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-[#111827]">Record payment</h2>
                <p className="text-sm text-[#6B7280]">Process payments for completed parking sessions. Amount is calculated based on duration.</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#374151]">
                  Completed record <span className="text-[#EF4444]">*</span>
                </label>
                <select
                  value={recordId}
                  onChange={(e) => setRecordId(e.target.value)}
                  className="w-full rounded-[16px] border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#1E40AF] focus:ring-2 focus:ring-[#DBEAFE]"
                  disabled={saving}
                >
                  <option value="">Select a completed record</option>
                  {unpaidRecords.map((record) => (
                    <option key={record.recordId} value={record.recordId}>
                      Record #{record.recordId} — {record.plateNumber} ({record.duration}h)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#374151]">Amount to pay</label>
                <input
                  type="text"
                  value={formatCurrency(amountPaid)}
                  readOnly
                  className="w-full rounded-[16px] border border-[#E2E8F0] bg-[#F9FAFB] px-4 py-3 text-sm text-[#111827]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#374151]">
                  Payment date <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full rounded-[16px] border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#1E40AF] focus:ring-2 focus:ring-[#DBEAFE]"
                  disabled={saving}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving || !recordId}>
                <Plus size={16} /> {saving ? 'Recording...' : 'Record payment'}
              </Button>
            </div>
          </form>
        </div>

        <div className="rounded-[28px] border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-xl font-semibold text-[#111827]">Payment records</h3>
          {loading ? (
            <Loader />
          ) : payments.length === 0 ? (
            <EmptyState title="No payments yet" message="Create payments for completed parking records." />
          ) : (
            <Table columns={columns} data={payments} loading={loading} emptyMessage="No payments found." />
          )}
        </div>
      </div>
    </Layout>
  );
};
