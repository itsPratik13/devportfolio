import React from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
};

const DashedCard = ({ children, className }: Props) => {
    return (
      <div className={cn("relative overflow-hidden w-full", className)}>
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="10 10"
            className="text-neutral-300 dark:text-[#4B5563]"
          />
        </svg>
  
        <div className="relative z-10">{children}</div>
      </div>
    );
  };
  export default DashedCard





















