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
    <div className="bg-white border border-slate-200/60 shadow-sm rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500 border-collapse">
          <thead className="bg-slate-50/75 border-b border-slate-200/60 text-slate-700 text-xs font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-800">Timestamp</th>
              <th className="px-6 py-4 font-semibold text-slate-800">User</th>
              <th className="px-6 py-4 font-semibold text-slate-800">Action Type</th>
              <th className="px-6 py-4 font-semibold text-slate-800">Resource</th>
              <th className="px-6 py-4 font-semibold text-slate-800">Details</th>
              <th className="px-6 py-4 font-semibold text-slate-800">Severity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.length > 0 ? (
              logs.map((log, index) => (
                <LogRow key={index} log={log} />
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-slate-400 text-sm">
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