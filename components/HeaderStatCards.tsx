import { cn } from "@/lib/utils";
import React from "react";
import CountUp from "./CountUp";

type HeaderStatCardProps = {
  className?: string;
  heading: string;

  value: string | number | null;
};
const HeaderStatCards = ({
  className,
  heading,

  value,
}: HeaderStatCardProps) => {
  return (
    <div
      className={cn(
        "w-full h-full flex flex-col justify-between items-center text-center p-4 rounded-md ",
        className
      )}
    >
      <h3 className={cn("", className)}>{heading}</h3>
      <h2 className="">
    {" "}
    {typeof value === "number" ? (
      <CountUp value={value} separator />
    ) : (
      value
    )}
  </h2>
    </div>
  );
};

export default HeaderStatCards;
