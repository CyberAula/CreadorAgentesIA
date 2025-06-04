'use client';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import '../app/globals.css';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  // Inicializa el estado desde localStorage al montar
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('darkmode');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('darkmode');
    }
  }, []);

  // Guarda en localStorage y cambia la clase
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('darkmode');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('darkmode');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <div
      onClick={toggleTheme}
      className="flex items-center bg-myBg rounded-xl p-1 cursor-pointer w-24 justify-between transition-colors"
      style={{ minWidth: "80px" }}
    >
      <div
        className={`flex items-center justify-center rounded-xl p-2 transition-colors ${
          !isDark ? "bg-primary " : ""
        }`}
      >
        <FontAwesomeIcon icon={faSun} className="text-white h-5 w-5" />
      </div>
      <div
        className={`flex items-center justify-center rounded-xl p-2 transition-colors ${
          isDark ? "bg-primary " : ""
        }`}
      >
        <FontAwesomeIcon icon={faMoon} className="text-luna h-5 w-5" />
      </div>
    </div>
  );
}
