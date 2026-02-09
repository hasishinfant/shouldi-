
import React from 'react';

interface DecisionPanelProps {
  title: string;
  children: React.ReactNode;
  accentColor?: string;
  className?: string;
  variant?: 'default' | 'verdict';
}

const DecisionPanel: React.FC<DecisionPanelProps> = ({ 
  title, 
  children, 
  accentColor = "bg-yellow-400 text-black",
  className = "",
  variant = 'default'
}) => {
  const isVerdict = variant === 'verdict';
  
  return (
    <div className={`comic-border ${isVerdict ? 'comic-shadow-lg' : 'comic-shadow'} bg-white relative flex flex-col min-h-[350px] overflow-hidden ${className}`}>
      {isVerdict && <div className="absolute inset-0 halftone-bg pointer-events-none" />}
      <div className={`relative z-10 comic-border ${accentColor} px-6 py-2 comic-font text-2xl uppercase border-t-0 border-l-0 border-r-0 mb-4 inline-block`}>
        {title}
      </div>
      <div className="relative z-10 px-6 pb-8 flex-grow overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default DecisionPanel;
