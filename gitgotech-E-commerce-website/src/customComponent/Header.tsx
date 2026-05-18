
import React from 'react';
import { ChevronRight, Flame, Star, TrendingUp, Zap, Clock } from 'lucide-react';

// Reusable Custom Header Component
export const SectionHeader = ({  
  title = "Hot Deals",  
  textsize = "md:text-[32px] text-[24px] text-white",
  font = "font-cormorant" 
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Icon */} 
        </div>  
        {/* Title & Subtitle */}
        <div>
          <h2 className={`${textsize} ${font}`}>{title}</h2>   
        </div>
      </div>  
   
  );
};