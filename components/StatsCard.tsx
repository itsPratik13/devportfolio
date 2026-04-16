"use client";
import { cn } from "@/lib/utils";
import React from "react";
import CountUp from "./CountUp";

type StatCardProps = {
  className?: string;
  heading: string;
  subheading?: string;
  value: string | number | null;
};
const StatsCard = ({
  className,
  heading,
  subheading,
  value,
}: StatCardProps) => {
  return (
    <div
      className={cn(
        "w-full h-full flex flex-col justify-between items-center text-center p-4 rounded-md",
        className
      )}
    >
      <h3 className="text-xl font-semibold mt-3">{heading}</h3>
      <h2 className="text-3xl font-bold mt-3">
        {" "}
        {typeof value === "number" ? (
          <CountUp value={value} separator />
        ) : (
          value
        )}
      </h2>
      <span className="text-[16px] font-light mt-3 ">{subheading}</span>
    </div>
  );
};

export default StatsCard;
