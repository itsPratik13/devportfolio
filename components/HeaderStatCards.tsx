import { cn } from "@/lib/utils";
import React from "react";

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
      <h2 className="">{value}</h2>
    </div>
  );
};

export default HeaderStatCards;
