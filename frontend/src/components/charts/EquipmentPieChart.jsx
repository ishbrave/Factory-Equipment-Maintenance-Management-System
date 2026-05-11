import { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from '../common';
import { STATUS_OPTIONS } from '../../utils/constants';

const COLORS = {
  Operational: '#22C55E',
  'Under Maintenance': '#F59E0B',
  'Out of Service': '#EF4444',
  Retired: '#94A3B8',
};

export const EquipmentPieChart = ({ equipment = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const data = useMemo(() => {
    return STATUS_OPTIONS.map((status) => ({
      name: status.value,
      value: equipment.filter((item) => item.status === status.value).length,
      color: COLORS[status.value],
    }));
  }, [equipment]);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const activeStatus = data[activeIndex] || data[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div className="rounded-[24px] border border-[#E2E8F0] bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6B7280]">Equipment status</p>
            <p className="mt-1 text-sm text-[#6B7280]">Current breakdown</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-semibold text-[#111827]">{total}</p>
            <p className="text-xs text-[#6B7280]">total</p>
          </div>
        </div>
        <div className="relative h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={55}
                outerRadius={activeIndex !== null ? 80 + 8 : 80}
                dataKey="value"
                paddingAngle={2}
                onClick={(_, index) => setActiveIndex(index)}
              >
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={entry.color} stroke={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value}`, 'Count']}
                contentStyle={{ borderRadius: 16, borderColor: '#E2E8F0' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="space-y-3 rounded-[24px] border border-[#E2E8F0] bg-white p-6 shadow-sm">
        {data.map((row, index) => (
          <button
            key={row.name}
            className={`flex w-full items-center justify-between gap-4 rounded-3xl border p-4 text-left transition ${index === activeIndex ? 'border-[#1E40AF] bg-[#EFF6FF]' : 'border-transparent hover:bg-[#F8FAFC]'}`}
            onClick={() => setActiveIndex(index)}
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-3.5 w-3.5 rounded-full" style={{ background: row.color }}></span>
              <div>
                <p className="text-sm font-semibold text-[#111827]">{row.name}</p>
                <p className="text-sm text-[#6B7280]">{((row.value / Math.max(total, 1)) * 100).toFixed(0)}%</p>
              </div>
            </div>
            <Badge variant="primary">{row.value}</Badge>
          </button>
        ))}
      </div>
    </div>
  );
};
