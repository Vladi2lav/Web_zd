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
}

export default function Main({ items }: MainProps) {
  return (
    <main className="main-content">
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
              <Contain data={data} />
            </section>
          );
        })}
      </div>
    </main>
  );
}