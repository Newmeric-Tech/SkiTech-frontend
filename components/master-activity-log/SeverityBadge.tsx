import React from 'react';

interface SeverityBadgeProps {
  severity: 'Info' | 'Warning' | 'Critical';
}

const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity }) => {
  const styles = {
    Info: 'bg-blue-50 text-blue-700 border-blue-200/60',
    Warning: 'bg-amber-50 text-amber-700 border-amber-200/60',
    Critical: 'bg-rose-50 text-rose-700 border-rose-200/60',
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