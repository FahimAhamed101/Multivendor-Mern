
import React, { useState } from 'react';
import './index.css';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { TrendingUp, ChevronDown } from 'lucide-react';

const Dashboard = () => {
  const [selectedYear, setSelectedYear] = useState('2025');

  // Generate monthly data for different years
  const generateMonthlyData = (year) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Different data patterns for different years
    const dataPatterns = {
      '2023': [420, 380, 520, 460, 580, 720, 680, 590, 640, 550, 480, 600],
      '2024': [450, 520, 480, 620, 580, 680, 720, 590, 660, 570, 500, 630],
      '2025': [480, 550, 510, 650, 610, 700, 750, 620, 680, 590, 520, 660]
    };
    
    const values = dataPatterns[year] || dataPatterns['2025'];
    const maxValue = Math.max(...values);
    
    return months.map((month, index) => ({
      month,
      value: values[index],
      isHighlight: values[index] === maxValue // Highlight the highest month
    }));
  };

  const currentData = generateMonthlyData(selectedYear);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm z-50">
          <p>{`${label}: $${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  // Data for the pie chart
  const fitnessData = [
    { name: '1st Class', value: 42, color: '#10b981' },
    { name: '2nd Class', value: 24, color: '#f59e0b' },
    { name: '3rd Class', value: 16, color: '#f97316' },
    { name: 'Failed', value: 18, color: '#6b7280' }
  ];

  // Custom tooltip for fitness chart
  const FitnessTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm z-50">
          <p>{`${data.name}: ${data.value}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Total Earnings Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Earning</p>
                <h2 className="text-3xl font-bold text-gray-900">$682.5</h2>
              </div>
              <div className="flex items-center gap-4">
                {/* Year Dropdown */}
                <div className="relative">
                  <select 
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="appearance-none bg-gray-100 text-gray-700 py-2 px-4 pr-8 rounded-lg text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 border-0"
                    style={{ backgroundImage: 'none' }}
                  >
                    <option value="2023">2023</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
                <div className="p-2 bg-gray-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            </div>
            
            {/* Bar Chart */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={currentData} 
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  barCategoryGap="20%"
                >
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                  />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} cursor={false} />
                  <Bar 
                    dataKey="value" 
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  >
                    {currentData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.isHighlight ? '#059669' : '#e5e7eb'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Target line indicator */}
            <div className="relative mt-4">
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-400">Monthly Target</div>
                <div className="text-xs text-gray-400">$170</div>
              </div>
              <div className="w-full h-px bg-gray-300 mt-1" style={{ borderTop: '1px dashed #d1d5db' }}></div>
            </div>
          </div>

          {/* Fitness Test Overview Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Fitness Test Overview</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-gray-800 transition-colors">
                <span>PFT Test</span>
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
            
            {/* Pie Chart */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={fitnessData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      startAngle={90}
                      endAngle={450}
                      stroke="none"
                    >
                      {fitnessData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          className="hover:opacity-80 transition-opacity cursor-pointer"
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<FitnessTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Center text */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">100%</div>
                    <div className="text-xs text-gray-500">Total</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="grid grid-cols-2 gap-4">
              {fitnessData.map((item, index) => (
                <div key={index} className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded-lg transition-colors">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-600 flex-grow">{item.name}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;