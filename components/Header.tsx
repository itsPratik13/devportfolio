import { cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";
import { motion } from "motion/react";
import RotatingText from "./RotatingText";
import ThemeToggle from "./ModeToggle";

type HeaderProps = {
  User: {
    name: string;
    avatarUrl?: string | null;
  };
  contributions?: {
    total?: number;
    currentStreak?: number;
    longestStreak?: number;
  };
};

const Header = ({ User, contributions }: HeaderProps) => {
  const rotatingTextArray = [
    "Software Engineer",
    "Fullstack Developer",
    "Open Source Contributor",
  ];
  return (
    <HeaderCard className=" relative h-full p-6 mt-20 ">
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
      <HeaderCardTitle className="">
        <div className="flex items-center justify-between w-full">
          {/* left section  */}
          <div className="flex items-center gap-10 ">
            <Image
              src={
                User.avatarUrl ||
                "https://images.unsplash.com/photo-1728577740843-5f29c7586afe?q=80&w=880&auto=format&fit=crop"
              }
              alt="logo"
              height={50}
              width={50}
              className="size-20 rounded-xl "
            />
            <div className="flex flex-col items-center">
              <span className="mt-2  text-2xl font-semibold text-neutral-100">
                {User.name}
              </span>
              <div className="mt-3 text-sm text-neutral-400 h-6 flex items-center justify-center min-w-[220px]">
                <RotatingText
                  texts={rotatingTextArray}
                  className="inline-flex"
                />
              </div>
            </div>
          </div>
          {/* right section */}
          <div className="absolute top-4 right-4"><ThemeToggle/></div>
          <span className="absolute bottom-4 right-4 mr-3 mb-3 text-sm text-neutral-400">
            {" "}
            Longest streak: {contributions?.longestStreak}
          </span>
        </div>
      </HeaderCardTitle>
    </HeaderCard>
  );
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
