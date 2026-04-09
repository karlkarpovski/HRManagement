import React from 'react';
import '../styles/components.css';

/**
 * Stats Card Component - Display key metrics
 */
const StatsCard = ({ title, value, icon, color = 'blue' }) => {
  return (
    <div className={`stats-card stats-${color}`}>
      <div className="stats-icon">{icon}</div>
      <div className="stats-content">
        <h3>{title}</h3>
        <p className="stats-value">{value}</p>
      </div>
    </div>
  );
};

export default StatsCard;
