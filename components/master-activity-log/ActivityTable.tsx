import React from 'react';
import LogRow from './LogRow';

interface Log {
  timestamp: string;
  user: string;
  actionType: string;
  resource: string;
  details: string;
  severity: 'Info' | 'Warning' | 'Critical';
}

interface ActivityTableProps {
  logs: Log[];
}

const ActivityTable: React.FC<ActivityTableProps> = ({ logs }) => {
  return (
    <div className="bg-white dark:bg-[#1c1c1c] border border-slate-200/60 dark:border-white/10 shadow-sm rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400 border-collapse">
          <thead className="bg-slate-50/75 dark:bg-[#262626] border-b border-slate-200/60 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">Timestamp</th>
              <th className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">User</th>
              <th className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">Action Type</th>
              <th className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">Resource</th>
              <th className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">Details</th>
              <th className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">Severity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {logs.length > 0 ? (
              logs.map((log, index) => (
                <LogRow key={index} log={log} />
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-slate-400 dark:text-slate-500 text-sm">
                  No logs found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActivityTable;