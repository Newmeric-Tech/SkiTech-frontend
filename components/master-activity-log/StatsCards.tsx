import React from 'react';
import StatsCard from './StatsCard';
import { ActivitySummary } from '@/lib/api/activity-log';

interface StatsCardsProps {
  summary: ActivitySummary | null;
}

const StatsCards: React.FC<StatsCardsProps> = ({ summary }) => {
  const stats = [
    { label: 'Events (7 days)', value: summary?.total_events ?? '—' },
    { label: 'Warnings',        value: summary?.warnings     ?? '—' },
    { label: 'Critical',        value: summary?.critical     ?? '—' },
    { label: 'Log Size (est.)', value: summary ? `${summary.log_size_gb} GB` : '—' },
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
