"use client";
import React, { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "lucide-react";
import { useTheme } from "next-themes";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme:dark");
    setSystemTheme(mediaQuery.matches ? "dark" : "light");
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(mediaQuery.matches ? "dark" : "light");
    };
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);
  const Switch_Theme = () => {
    switch (theme) {
      case "light":
        setTheme("dark");
        return;
      case "dark":
        setTheme("light");
        return;
      case "system":
        setTheme(systemTheme === "dark" ? "light" : "dark");
        return;
    }
  };
  return (
    <button
      className="relative flex 
items-center justify-center size-6 
rounded-md"
      onClick={Switch_Theme}
    >
      <SunIcon
        className="absolute inset-0 size-6 
shrink-0 dark:scale-0 scale-100 dark:rotate-45 
transition-all duration-300 cursor-pointer 
m-auto"
        fill="currentColor"
      />
      <MoonIcon
        className="absolute inset-0 size-6 
shrink-0 dark:scale-100 scale-0  dark:rotate-0 
rotate-45 transition-all duration-300 
cursor-pointer m-auto "
        fill="currentColor"
      />
    </button>
  );
};

export default ThemeToggle;