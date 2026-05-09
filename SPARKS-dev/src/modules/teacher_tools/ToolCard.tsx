import React, { useState } from 'react';
import './ToolCard.css';

interface ToolCardProps {
  title: string;
  cardBorder: string;
  cardShadow: string;
  cardHeader: string;
  isFullscreen: boolean;
  onFullscreenToggle: () => void;
  children: React.ReactNode;
}

const ToolCard: React.FC<ToolCardProps> = ({
  title,
  cardBorder,
  cardShadow,
  cardHeader,
  isFullscreen,
  onFullscreenToggle,
  children,
}) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const cardStyle = {
    '--card-border': cardBorder,
    '--card-shadow': cardShadow,
    '--card-header': cardHeader,
  } as React.CSSProperties;

  return (
    <div
      className={`tool-card${isFullscreen ? ' fullscreen-mode' : ''}`}
      style={cardStyle}
    >
      {!isFullscreen && (
        <button
          className="favorite-btn"
          title="Add to Favorites"
          onClick={() => setIsFavorite(p => !p)}
        >
          {isFavorite ? '♥' : '♡'}
        </button>
      )}

      <button
        className="tool-fullscreen-btn"
        title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        onClick={onFullscreenToggle}
      >
        {isFullscreen ? '✕' : '⛶'}
      </button>

      {!isFullscreen && <h2>{title}</h2>}

      <div className={`tool-card-content${isFullscreen ? ' fullscreen' : ''}`}>
        {children}
      </div>
    </div>
  );
};

export default ToolCard;
