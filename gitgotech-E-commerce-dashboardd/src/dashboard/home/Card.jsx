 
import React from 'react';
import { TrendingUp } from 'lucide-react';
import { useGetAdminStatsQuery } from '../../redux/features/overview/overviewSlice';

const DashboardCards = () => {

  const { data: statsDataa, isLoading } = useGetAdminStatsQuery();

  const stats = statsDataa?.data;
  // console.log(stats)

  const statsData = [
    {
      id: 1,
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: '👥',
      gradient: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/10'
    },
    {
      id: 2,
      title: 'Total Revenue',
      value: `$${stats?.totalRevenue?.toLocaleString() || 0}`,
      icon: '💰',
      gradient: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-500/10'
    },
    {
      id: 3,
      title: 'Total Vendors',
      value: stats?.totalVendors || 0,
      icon: '👨‍💼',
      gradient: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-500/10'
    },
    {
      id: 4,
      title: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: '📦',
      gradient: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-500/10'
    },
    {
      id: 5,
      title: 'Total Orders',
     value: stats?.totalCustomVendorCompleteOrder || 0,
      icon: '🛒',
      gradient: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10'
    },
    {
      id: 6,
      title: 'Pending Orders',
      value: stats?.pendingOrder || 0,
      icon: '⏳',
      gradient: 'from-cyan-500 to-cyan-600',
      bgColor: 'bg-cyan-500/10'
    }
  ];

  return (
    <div className=" ">
      <div className=" "> 

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statsData.map((stat) => (
            <div
              key={stat.id}
              className="relative group"
            >
              {/* Card */}
              <div className="bg-gradient-to-bl from-[#413643] via-[#292929] rounded-2xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:transform hover:scale-[1.02] shadow-xl">
                {/* Header with Icon and Trend Button */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`${stat.bgColor} p-3 rounded-xl`}>
                      <span className="text-2xl">{stat.icon}</span>
                    </div>
                    <h3 className="text-gray-300 font-medium text-sm">
                      {stat.title}
                    </h3>
                  </div>
                  
                  {/* Trend Icon Button */}
                  <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                {/* Value */}
                <div className="mt-4">
                  <h2 className="text-4xl font-bold text-white">
                    {stat.value}
                  </h2>
                </div>

                {/* Gradient Border Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardCards;