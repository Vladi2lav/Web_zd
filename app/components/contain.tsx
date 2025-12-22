import { useState, useEffect } from 'react';

interface ContainerProps {
  url: string;
  name: string;
  number: string;
  id: string;
}

interface ContainProps {
  data: ContainerProps;
  isCompactView: boolean;
}

export default function Contain({ data, isCompactView }: ContainProps) {

  const handleCardClick = () => {
    if (data?.url) {
        window.open(data.url, '_blank');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleCardClick();
    }
  };

  return (
    <>
      <div className={`space-card ${isCompactView ? 'compact' : ''}`} onClick={handleCardClick} onKeyDown={handleKeyDown} role="button" tabIndex={0}>
        {/* Декоративный фон внутри карточки */}
        <div className="card-nebula" />
        <div className="card-grid" />
        
        <div className={`card-content ${isCompactView ? 'flex-row items-center justify-between' : ''}`}>
          <div className="card-header">
             <span className="card-badge">Задача № {data.number}</span>
          </div>

          <div className="card-main">
             <h2 className={`card-title ${isCompactView ? 'text-lg' : ''}`}>{data.name}</h2>
          </div>

          <div className="card-footer">
             <div className="card-meta">
                {/* <span className="label">UNIT ID</span>
                <code className="value">{data.id}</code> */}
             </div>
             <div className="card-action">
                
                <svg className={`${isCompactView ? 'w-4 h-4' : 'w-6 h-6'}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
             </div>
          </div>
        </div>
      </div>
      <button className={`download-btn ${isCompactView ? 'compact' : ''}`} onClick={() => window.open(`/api/download/${data.name}`, '_blank')}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 10V16M9 13L12 16L15 13M20 16V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V16C4 17.1046 4.89543 18 6 18H18C19.1046 18 20 17.1046 20 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {isCompactView ? 'Download' : 'Download ZIP'}
      </button>
    </>
  );
}