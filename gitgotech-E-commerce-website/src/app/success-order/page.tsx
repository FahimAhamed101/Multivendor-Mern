 
import OrderCompletedPage from '@/components/CustomerDashboard/OrderSuccess';
import HotDealsSection from '@/components/landingPage/HotDeals';
import React from 'react';

const page = () => {
    return (
        <div>
              <OrderCompletedPage />
              <HotDealsSection />
        </div>
    );
};

export default page;