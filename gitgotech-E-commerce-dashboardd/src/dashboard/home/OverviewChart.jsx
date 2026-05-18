import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import { ChevronDown } from 'lucide-react';
import { useGetUserVendorRatioQuery, useGetYearlyRevenueQuery } from '../../redux/features/overview/overviewSlice';

const MONTHS = [
  { label: 'January', value: '1' },
  { label: 'February', value: '2' },
  { label: 'March', value: '3' },
  { label: 'April', value: '4' },
  { label: 'May', value: '5' },
  { label: 'June', value: '6' },
  { label: 'July', value: '7' },
  { label: 'August', value: '8' },
  { label: 'September', value: '9' },
  { label: 'October', value: '10' },
  { label: 'November', value: '11' },
  { label: 'December', value: '12' },
];

const YEARS = ['2022', '2023', '2024', '2025', '2026'];

const DashboardCharts = () => {
  const currentYear = new Date().getFullYear().toString();
  const currentMonth = (new Date().getMonth() + 1).toString();

  const [revenueYear, setRevenueYear] = useState(currentYear);
  const [ratioYear, setRatioYear] = useState(currentYear);
  const [userMonth, setUserMonth] = useState(currentMonth);

  const { data: barchartData } = useGetYearlyRevenueQuery({ year: revenueYear });
  const { data: userVendorRatio } = useGetUserVendorRatioQuery({ month: userMonth, year: ratioYear });

  // Map API data to chart format, abbreviating month names
  const monthlyRevenueData = (barchartData?.data ?? []).map((item) => ({
    month: item.month.slice(0, 3),
    revenue: item.revenue,
  }));

  const userCount = userVendorRatio?.data?.user ?? 0;
  const vendorCount = userVendorRatio?.data?.vendor ?? 0;

  const userRatioData = [
    { name: 'Users Joined', value: userCount, color: '#a855f7' },
    { name: 'Vendors Joined', value: vendorCount, color: '#7c3aed' },
  ];

  const RADIAN = Math.PI / 180;

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (cx == null || cy == null || innerRadius == null || outerRadius == null) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const ncx = Number(cx);
    const ncy = Number(cy);
    const x = ncx + radius * Math.cos(-(midAngle ?? 0) * RADIAN);
    const y = ncy + radius * Math.sin(-(midAngle ?? 0) * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor={x > ncx ? 'start' : 'end'} dominantBaseline="central" className="text-sm font-semibold">
        {`${((percent ?? 1) * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1f1b24] border border-purple-500/50 rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold">${payload[0].value.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1f1b24] border border-purple-500/50 rounded-lg p-3 shadow-xl">
          <p className="text-gray-300 text-sm">{payload[0].name}</p>
          <p className="text-white font-semibold">{payload[0].value.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => (
    <div className="flex flex-col gap-3 mt-6">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-300 text-sm">{entry.value}</span>
          </div>
          <span className="text-white font-semibold">
            {userRatioData[index].value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );

  const SelectDropdown = ({ value, onChange, options }) => (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-white border border-cyan-500/30 rounded-lg px-4 py-2 pr-10 appearance-none cursor-pointer focus:outline-none focus:border-cyan-500/60 transition-colors"
      >
        {options.map((opt) => (
          <option key={opt.value ?? opt} value={opt.value ?? opt} className="bg-[#1f1b24]">
            {opt.label ?? opt}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white pointer-events-none" />
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 mt-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Monthly Revenue Chart */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-tr from-[#05011a] via-[#0f0536] to-[#07021d] border shadow-[0_0_12px_rgba(34,211,238,0.35)] border-purple-500/40 p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white text-lg font-semibold">Monthly Revenue</h3>
              <SelectDropdown
                value={revenueYear}
                onChange={setRevenueYear}
                options={YEARS.map((y) => ({ label: y, value: y }))}
              />
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="month" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={{ stroke: '#374151' }} />
                <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={{ stroke: '#374151' }} tickFormatter={(v) => `${v >= 1000 ? v / 1000 + 'k' : v}`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(168, 85, 247, 0.1)' }} />
                <Bar dataKey="revenue" fill="#912DAD" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User/Vendor Ratio Pie Chart */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-tr from-[#05011a] via-[#0f0536] to-[#07021d] border shadow-[0_0_12px_rgba(34,211,238,0.35)] border-purple-500/40 p-4 rounded-2xl h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-semibold">User Ratio</h3>
              <div className="flex gap-2">
                <SelectDropdown
                  value={userMonth}
                  onChange={setUserMonth}
                  options={MONTHS.map((m) => ({ label: m.label, value: m.value }))}
                />
                <SelectDropdown
                  value={ratioYear}
                  onChange={setRatioYear}
                  options={YEARS.map((y) => ({ label: y, value: y }))}
                />
              </div>
            </div>

            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={userRatioData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {userRatioData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend content={<CustomLegend />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardCharts;