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
  const [isMobile, setIsMobile] = useState(false);
  const [isCompactView, setIsCompactView] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsCompactView(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial value

    // Чтение темы из cookies
    const themeCookie = document.cookie.split('; ').find(row => row.startsWith('theme='))?.split('=')[1];
    if (themeCookie === 'dark') {
      setIsDarkTheme(true);
    }

    return () => window.removeEventListener('resize', handleResize);
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

  const toggleCompactView = () => {
    setIsCompactView(!isCompactView);
  };

  return (
    <div className="app-container">
      {!isMobile && (
        <Panel
          items={containerData}
          isMobile={isMobile}
          width={panelWidth}
          setWidth={setPanelWidth}
          isDarkTheme={isDarkTheme}
          toggleTheme={toggleTheme}
        />
      )}
      {isMobile && (
        <div className="mobile-header">
          <button className="mobile-toggle-theme-btn" onClick={toggleTheme}>
            <span className="theme-icon">{isDarkTheme ? '☀️' : '🌙'}</span>
          </button>
          <button className="mobile-toggle-compact-btn" onClick={toggleCompactView}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6H20M4 10H20M4 14H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {isCompactView ? 'Expanded' : 'Compact'}
          </button>
        </div>
      )}
      <Main items={containerData} isCompactView={isCompactView} width={panelWidth} />
    </div>
  );
}