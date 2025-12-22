'use client';

import React, { useState, useEffect } from 'react';

interface PanelProps {
  items: { id: string; name: string }[];
  isMobile: boolean;
  width: number;
  setWidth: (width: number) => void;
  isDarkTheme: boolean;
  toggleTheme: () => void;
}

export default function Panel({ items, isMobile, width, setWidth, isDarkTheme, toggleTheme }: PanelProps) {
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    setStartX(e.clientX);
    setStartWidth(width);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = startWidth + (e.clientX - startX);
        if (newWidth >= 200 && newWidth <= 600) { // min and max width
          setWidth(newWidth);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, startX, startWidth, setWidth]);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <aside className="side-panel" style={!isMobile ? { width: `${width}px`, cursor: isResizing ? 'ew-resize' : 'ew-resize', position: 'relative' } : {}}>

      <div className="panel-header">
        <div className="status-dot" />
        <span className="panel-title">Gubayev Vladislav</span>
      </div>

      <nav className="panel-nav">
        {items.map((item) => (
          <button 
            key={item.id} 
            onClick={() => scrollTo(item.id)} 
            className="nav-item"
          >
            <span className="nav-hex">⬢</span>
            <span className="nav-label">{item.name}</span>
          </button>
        ))}
      </nav>

      <div className="panel-footer">
        <button className="theme-switch-btn" onClick={toggleTheme}>
          <span className="theme-icon">{isDarkTheme ? '☀️' : '🌙'}</span>
          <span className="label">{isDarkTheme ? 'Light' : 'Dark'}</span>
        </button>
        <p className="system-ver">ado</p>
      </div>

      {!isMobile && (
        <div
          className="resize-handle"
          onMouseDown={handleMouseDown}
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '5px',
            cursor: 'ew-resize',
            background: 'transparent',
          }}
        />
      )}
    </aside>
  );
}