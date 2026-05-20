import React from 'react';
import StatsCard from './StatsCard';

const StatsCards: React.FC = () => {
  const stats = [
    { label: 'Events Today', value: 120 },
    { label: 'Warnings', value: 15 },
    { label: 'Critical', value: 5 },
    { label: 'Log Size', value: '1.2GB' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
      {stats.map((stat, index) => (
        <StatsCard key={index} label={stat.label} value={stat.value} />
      ))}
    </div>
  );
};

export default StatsCards;