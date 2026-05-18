'use client';

import BannerSection from '@/components/landingPage/Banner';
import CategoryMarquee from '@/components/landingPage/CategoryMarquee';
import SimpleFAQ from '@/components/landingPage/FaQuestion';
 
import HotDealsSection from '@/components/landingPage/HotDeals';
import TopRated from '@/components/landingPage/TopRated';
 
import { Button } from 'antd';
import { ArrowRight, Code, Smartphone, Cloud, Zap } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="">
         <BannerSection />
         <CategoryMarquee />
         <HotDealsSection />
         <TopRated />
         <SimpleFAQ />
       
    </div>
  );
}