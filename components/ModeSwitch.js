"use client";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon } from "@fortawesome/free-solid-svg-icons";

export default function ModeSwitch() {
  const [isMounted, setIsMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Inicializa el modo según localStorage
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    if (html.classList.contains("dark")) {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  if (!isMounted) return null;

  return (
    <div
      onClick={toggleTheme}
      className="flex items-center bg-[var(--switch-bg)] rounded-full p-1 cursor-pointer w-24 justify-between transition-colors"
      style={{ minWidth: "80px" }}
    >
      <div
        className={`flex items-center justify-center rounded-full p-2 transition-colors ${
          !isDark ? "bg-[var(--switch-active-color)] text-[var(--switch-bg)]" : ""
        }`}
      >
        <FontAwesomeIcon icon={faSun} className="text-[var(--switch-icon-color)] h-5 w-5" />
      </div>
      <div
        className={`flex items-center justify-center rounded-full p-2 transition-colors ${
          isDark ? "bg-[var(--switch-active-color)] text-[var(--switch-bg)]" : ""
        }`}
      >
        <FontAwesomeIcon icon={faMoon} className="text-[var(--switch-icon-color)] h-5 w-5" />
      </div>
    </div>
  );
}
