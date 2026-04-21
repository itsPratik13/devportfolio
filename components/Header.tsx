import Image from "next/image";
import React from "react";
import RotatingText from "./RotatingText";
import ThemeToggle from "./ModeToggle";

import HeaderStatCards from "./HeaderStatCards";

type HeaderProps = {
  User: {
    name: string;
    avatarUrl?: string | null;
    followers:number |0
    repos:any |0
  };
  contributions?: {
    currentStreak?: number;
    longestStreak?: number;
  };
};

const Header = ({ User, contributions }: HeaderProps) => {
  return (
    <div className="relative p-6 flex items-center justify-between">
      {/* LEFT SIDE */}
      <div className="flex items-center gap-4">
        <Image
          src={
            User.avatarUrl ||
            "https://images.unsplash.com/photo-1728577740843-5f29c7586afe?q=80&w=880&auto=format&fit=crop"
          }
          alt="avatar"
          width={80}
          height={80}
          className="size-20 rounded-xl"
        />

        <div className="flex flex-col">
          <span className="text-2xl font-semibold text-neutral-700 dark:text-neutral-100">
            {User.name}
          </span>

          <div className="text-[11px] text-neutral-600 h-6 flex items-center border border-neutral-500 overflow-hidden w-[155px] rounded-md mt-1 dark:text-neutral-300 mx-auto">
            <RotatingText
              texts={[
                "Software Engineer",
                "Fullstack Developer",
                
              ]}
              className="ml-2 tracking-tight "
            />
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex  items-center justify-between mt-6">
        {/* <span className="text-sm text-neutral-500"> */}
          {/* Longest streak: {contributions?.longestStreak} */}
        {/* </span> */}
        {/* <span className="text-sm text-neutral-500"> */}
          {/* Longest streak: {contributions?.longestStreak} */}
        {/* </span> */}
        {/* <span className="text-sm text-neutral-500"> */}
          {/* Longest streak: {contributions?.longestStreak} */}
        {/* </span> */}
        <HeaderStatCards heading="Followers" value={User.followers} className="text-sm font-semibold text-neutral-500 mb-1 dark:text-neutral-400"/>
        <HeaderStatCards heading="Repos" value={User.repos.length} className="text-sm font-semibold text-neutral-500 mb-1 dark:text-neutral-400"/>
      </div>
      <div className=" absolute top-2 right-2">
        <ThemeToggle />
      </div>
    </div>
  );
};

export default Header;
