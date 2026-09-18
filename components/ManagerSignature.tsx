"use client";

import React from 'react';

interface ManagerSignatureProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

export default function ManagerSignature({ 
  className = "h-16 w-36 text-blue-700",
  width,
  height
}: ManagerSignatureProps) {
  return (
    <div className="relative inline-flex items-center justify-center select-none pointer-events-none">
      <svg 
        viewBox="0 0 1000 1000" 
        width={width}
        height={height}
        className={className} 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0px 1px 1px rgba(29, 78, 216, 0.2))' }}
      >
        <path 
          d="M 125 640 
             C 115 655, 30 780, 30 890 
             C 30 965, 80 975, 120 920 
             C 155 870, 175 730, 185 680 
             L 715 275 
             L 935 55 
             C 950 42, 952 65, 930 85 
             C 840 145, 680 185, 595 205 
             C 585 207, 590 220, 615 235 
             L 715 275 
             C 730 330, 725 385, 750 405 
             C 775 425, 835 425, 855 365" 
          stroke="currentColor" 
          strokeWidth="24" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
