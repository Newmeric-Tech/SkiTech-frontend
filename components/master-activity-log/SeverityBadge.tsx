import React from 'react';

interface SeverityBadgeProps {
  severity: 'Info' | 'Warning' | 'Critical';
}

const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity }) => {
  const styles = {
    Info: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200/60 dark:border-blue-700/40',
    Warning: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-700/40',
    Critical: 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200/60 dark:border-rose-700/40',
  };

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[severity]}`}
    >
      {severity}
    </span>
  );
};

export default SeverityBadge;