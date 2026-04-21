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
    <motion.div
      className={cn("relative overflow-hidden w-full rounded-lg", className)}
      initial="rest"
      whileHover="hover"
     variants={{
      rest: { scale: 1 },
    hover: { scale: 1.04,transition:{duration:0.3,ease:"easeInOut"} },
     }}
    >
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
          className="text-neutral-400/70 dark:text-[#49505b]"
          variants={{
            rest: { strokeDashoffset: 0 },
            hover: {
              strokeDashoffset: -24,
              

              transition: {
                duration: 1.2,
                ease: "linear",
                repeat: Infinity,
              },
            },
          }}
          
        />
      </svg>

      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};

export default DashedCard;
