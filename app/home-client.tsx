'use client';

import { useState, useEffect } from 'react';
import Main from "./components/main";
import Panel from "./components/panel";

interface HomeClientProps {
  containerData: { id: string; name: string; number: string; uniqueId: string; url: string }[];
}

export default function HomeClient({ containerData }: HomeClientProps) {
  const [panelWidth, setPanelWidth] = useState(280);
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    // Чтение темы из cookies
    const themeCookie = document.cookie.split('; ').find(row => row.startsWith('theme='))?.split('=')[1];
    if (themeCookie === 'dark') {
      setIsDarkTheme(true);
    }
  }, []);

  useEffect(() => {
    if (isDarkTheme) {
      document.documentElement.classList.add('dark-theme');
      document.cookie = "theme=dark; max-age=604800; path=/"; // 1 неделя
    } else {
      document.documentElement.classList.remove('dark-theme');
      document.cookie = "theme=light; max-age=604800; path=/";
    }
  }, [isDarkTheme]);

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
    console.log('Theme toggled:', !isDarkTheme);
  };

  return (
    <div className="app-container">
      <Panel
        items={containerData}
        isMobile={false}
        width={panelWidth}
        setWidth={setPanelWidth}
        isDarkTheme={isDarkTheme}
        toggleTheme={toggleTheme}
      />
      <Main items={containerData} />
    </div>
  );
}