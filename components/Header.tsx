import { cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";

type HeaderProps={
    User:{
        name:string,
        avatarUrl?:string|null
    }
}

const Header = ({User}:HeaderProps) => {
  return <HeaderCard className=" relative h-full p-6 mt-20 "
  >
      <svg className="absolute inset-0 w-full h-full  ">
    <rect
      x="0"
      y="0"
      width="100%"
      height="100%"
      fill="none"
      stroke="#CCCCCC"
      strokeWidth="2"
      strokeDasharray="10 10"
      className="dark:stroke-[#4B5563]" // dash gap
    />
  </svg>
  <HeaderCardTitle>
    <div>
       <Image src={User.avatarUrl||}
    </div>
  </HeaderCardTitle>
  </HeaderCard>;
};

const HeaderCard = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={cn("w-full", className)}>{children}</div>;
};

const HeaderCardTitle = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <h2 className={cn("", className)}>{children}</h2>;
};

export default Header;
