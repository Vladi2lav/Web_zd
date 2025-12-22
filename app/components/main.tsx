'use client';

import React from 'react';
import Contain from './contain';

interface MainProps {
  items: { 
    id: string; 
    name: string; 
    number: string; 
    uniqueId: string; 
    url: string 
  }[];
  isCompactView: boolean;
  width: number;
}

export default function Main({ items, isCompactView, width }: MainProps) {
  return (
    <main className="main-content" style={{ left: `${width}px`, width: `calc(100vw - ${width}px)` }}>
      <div className="main-grid">
        {items.map((item) => {
          
          const data = {
            url: item.url,
            name: item.name,
            number: item.number,
            id: item.uniqueId
          };

          return (
            <section key={item.id} id={item.id} className="scroll-section">
              <Contain data={data} isCompactView={isCompactView} />
            </section>
          );
        })}
      </div>
    </main>
  );
}