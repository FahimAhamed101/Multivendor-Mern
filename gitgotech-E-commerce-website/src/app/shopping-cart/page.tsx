import ShoppingCart from '@/components/CustomerDashboard/ShoppingCart';
import HotDealsSection from '@/components/landingPage/HotDeals';
import React from 'react';

const page = () => {
    return (
        <div>
            <ShoppingCart />
            <HotDealsSection />
        </div>
    );
};

export default page;