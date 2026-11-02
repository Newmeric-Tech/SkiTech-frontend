import type { ReactNode } from "react";
import { AlertCircle, ClipboardList, Loader2, RefreshCw } from "lucide-react";

// Shared by the KRA panels so the three states look the same on every page
export const kraInputClass =
  "w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200";

export const kraPrimaryButtonClass =
  "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950 text-white text-sm font-semibold hover:bg-slate-800 dark:bg-[#6366f1] dark:hover:bg-[#4f46e5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

export const kraSecondaryButtonClass =
  "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

export function KraLoading() {
  return (
    <div className="flex items-center justify-center py-16" role="status" aria-label="Loading">
      <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
    </div>
  );
}

export function KraErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-3 text-center" role="alert">
      <AlertCircle className="w-8 h-8 text-slate-400" />
      <p className="text-sm text-slate-600">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className={kraSecondaryButtonClass}>
          <RefreshCw className="w-4 h-4" /> Try again
        </button>
      )}
    </div>
  );
}

export function KraEmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-2 text-center">
      <ClipboardList className="w-8 h-8 text-slate-400" />
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      {children && <p className="text-sm text-slate-500 max-w-md">{children}</p>}
    </div>
  );
}
