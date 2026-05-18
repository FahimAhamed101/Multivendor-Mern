import React from 'react';
import { ShoppingCart, Heart, Download, Send, Check, ArrowRight, Sparkles } from 'lucide-react';

type Variant = "primary" | "secondary" | "gradient" | "glass" | "glow" | "outline" | "shine";
type Size = "sm" | "md" | "lg";
type IconPosition = "left" | "right";

// Custom Button Component with Multiple Variants
export const CustomButton = ({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  fullWidth = false,

  onClick = () => {},
  disabled = false
}: {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  icon?: React.ComponentType<{ className?: string; w?: number; h?: number; }>;
  iconPosition?: IconPosition;
  fullWidth?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) => {
  
  const baseStyles = "relative overflow-hidden font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg shadow-purple-500/50 hover:shadow-purple-500/80 hover:scale-105",
    
    secondary: "border-2 border-purple-500/50 hover:border-purple-400 hover:bg-purple-500/10 text-white hover:scale-105",
    
    gradient: "bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white shadow-lg hover:shadow-2xl hover:scale-105",
    
    glass: "bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white hover:scale-105",
    
    glow: "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-[0_0_30px_rgba(168,85,247,0.6)] hover:shadow-[0_0_50px_rgba(168,85,247,0.8)] hover:scale-105",
    
    outline: "border-2 border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white hover:scale-105",
    
    shine: "bg-gradient-to-r from-purple-600 to-purple-700 text-white relative overflow-hidden hover:scale-105"
  };
  
  const sizes = {
    sm: "px-4 py-2 text-sm rounded-lg",
    md: "px-6 py-3 text-base rounded-xl",
    lg: "px-8 py-4 text-lg rounded-2xl"
  };
  
  const widthClass = fullWidth ? "w-full" : "";
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} group`}
    >
      {/* Shine Effect for 'shine' variant */}
      {variant === 'shine' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
      )}
      
      {/* Ripple Effect */}
      <div className="absolute inset-0 bg-white/10 scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 rounded-full transition-all duration-500"></div>
      
      {/* Content */}
      <span className="relative z-10 flex items-center gap-2">
        {Icon && iconPosition === 'left' && <Icon className="w-5 h-5 transition-transform group-hover:rotate-12" />}
        {children}
        {Icon && iconPosition === 'right' && <Icon className="w-5 h-5 transition-transform group-hover:translate-x-1" />}
      </span>
    </button>
  );
};
