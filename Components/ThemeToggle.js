'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('darkmode');
    } else {
      root.classList.remove('darkmode');
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="p-2 bg-foreground text-background rounded"
    >
      {isDark ? 'Modo Claro ☀️' : 'Modo Oscuro 🌙'}
    </button>
  );
}
