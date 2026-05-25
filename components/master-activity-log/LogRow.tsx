import React from 'react';
import SeverityBadge from './SeverityBadge';

interface LogRowProps {
  log: {
    timestamp: string;
    user: string;
    actionType: string;
    resource: string;
    details: string;
    severity: 'Info' | 'Warning' | 'Critical';
  };
}

const LogRow: React.FC<LogRowProps> = ({ log }) => {
  return (
    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-slate-900 dark:text-slate-100 font-medium">{log.timestamp}</td>
      <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-300">{log.user}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="bg-slate-100/80 dark:bg-slate-700/60 px-2 py-1 rounded-md text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
          {log.actionType}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-300">{log.resource}</td>
      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{log.details}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <SeverityBadge severity={log.severity} />
      </td>
    </tr>
  );
};

export default LogRow;