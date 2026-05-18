
'use client'
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Mock data for analytics
  const salesData = [
    { month: 'Jan', revenue: 12000, orders: 45 },
    { month: 'Feb', revenue: 19000, orders: 62 },
    { month: 'Mar', revenue: 15000, orders: 53 },
    { month: 'Apr', revenue: 21000, orders: 78 },
    { month: 'May', revenue: 18000, orders: 65 },
    { month: 'Jun', revenue: 24000, orders: 89 }
  ];

  const productData = [
    { name: 'T-Shirts', value: 35, revenue: 8400 },
    { name: 'Jeans', value: 25, revenue: 12500 },
    { name: 'Shirts', value: 20, revenue: 6000 },
    { name: 'Jackets', value: 15, revenue: 9000 },
    { name: 'Accessories', value: 5, revenue: 2000 }
  ];

  const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  const recentOrders = [
    { id: '#ORD-001', customer: 'Sarah Johnson', product: 'Custom Denim Jacket', amount: '₵245.00', status: 'Completed', date: '2025-12-20' },
    { id: '#ORD-002', customer: 'Mike Chen', product: 'Tailored Dress Shirt', amount: '₵89.50', status: 'Processing', date: '2025-12-19' },
    { id: '#ORD-003', customer: 'Emma Davis', product: 'Family Matching Outfit', amount: '₵420.00', status: 'Completed', date: '2025-12-18' },
    { id: '#ORD-004', customer: 'Alex Rodriguez', product: 'Custom Suit', amount: '₵580.00', status: 'Shipped', date: '2025-12-17' },
    { id: '#ORD-005', customer: 'Lisa Wang', product: 'Casual T-Shirt Set', amount: '₵65.00', status: 'Completed', date: '2025-12-16' }
  ];

  const stats = [
    { title: 'Total Revenue', value: '₵124,560', change: '+12.5%', positive: true },
    { title: 'Total Orders', value: '1,247', change: '+8.2%', positive: true },
    { title: 'Avg. Order Value', value: '₵99.89', change: '+3.1%', positive: true },
    { title: 'Conversion Rate', value: '4.2%', change: '-0.8%', positive: false }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-r from-black via-[#0f0924] to-black text-white p-4 md:p-8">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
              <p className="text-sm text-gray-600">Product Analytics & Performance</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome back,</p>
                <p className="font-medium text-gray-900">Tailor Pro Studio</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                TS
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {['overview', 'products', 'orders', 'customers'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 font-medium text-sm capitalize transition-colors duration-200 ${
                  activeTab === tab
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</p>
                  <p className={`text-sm ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change} vs last month
                  </p>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Revenue Chart */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="revenue" name="Revenue (₵)" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Product Categories */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Categories</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={productData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : '0'}%`}
                      >
                        {productData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name, props) => [`${props.payload.revenue} revenue`, 'Revenue']}
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">{order.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customer}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.product}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{order.amount}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Performance</h3>
            <div className="space-y-4">
              {productData.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                      {product.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{product.name}</h4>
                      <p className="text-sm text-gray-600">{product.value}% of orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">₵{product.revenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Analysis</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="orders" 
                    name="Orders" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 mb-2">1,247</div>
                <div className="text-gray-600">Total Customers</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-2">42%</div>
                <div className="text-gray-600">Repeat Customers</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">3.2</div>
                <div className="text-gray-600">Avg. Orders per Customer</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
