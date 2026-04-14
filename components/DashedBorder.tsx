"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

type Props = {
  children: React.ReactNode;
  className?: string;
};

const DashedCard = ({ children, className }: Props) => {
  return (
    <div className={cn("relative overflow-hidden w-full rounded-lg", className)}>
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <motion.rect
          x="1" 
          y="1"
          width="calc(100% - 2px)"
          height="calc(100% - 2px)"
          rx="8"
          ry="8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="6 6" 
          className="text-neutral-300 dark:text-[#4B5563]"
          animate={{ strokeDashoffset: [0, -24] }}
          transition={{
            duration: 1.2,
            ease: "linear",
            repeat: 1,
          }}
        />
      </svg>

      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default DashedCard;