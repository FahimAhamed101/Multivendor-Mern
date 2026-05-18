import MyDashboard from '@/components/CustomerDashboard/Dashboard';
import HotDealsSection from '@/components/landingPage/HotDeals';
import React from 'react';

const page = () => {
    return (
        <div>
             <MyDashboard />
             <HotDealsSection />
        </div>
    );
};

export default page;