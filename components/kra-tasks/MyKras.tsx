"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Hash, Hourglass, Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  KRA_CONFLICT_MESSAGE, KRA_FREQUENCIES, KraFrequency, KraOccurrence,
  isKraConflict, kraErrorMessage, kraTasksAPI,
} from "@/lib/api/kraTasks";
import { formatServerTime, localDateString } from "@/lib/utils/localDate";
import { FREQUENCY_LABELS, KraPeriodLabel, KraStatusBadge } from "./KraLabels";
import {
  KraEmptyState, KraErrorState, KraLoading,
  kraInputClass, kraPrimaryButtonClass, kraSecondaryButtonClass,
} from "./KraPanelStates";

// The server takes up to 12 digits before the point and 2 after
const VALUE_PATTERN = /^\d{1,12}(\.\d{1,2})?$/;

// GET /my rejects a "today" more than a day away from the server's date
const LOAD_ERRORS = { 422: "Your device's date looks wrong. Please check it and try again." };

type DialogTarget = { kind: "delay" | "complete"; task: KraOccurrence };

function ActionDialog({ target, onClose, onDone, onConflict }: {
  target: DialogTarget | null;
  onClose: () => void;
  onDone: () => void;
  onConflict: () => void;
}) {
  const [text, setText] = useState("");
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setText("");
    setValue("");
    setError("");
  }, [target]);

  if (!target) return null;
  const { kind, task } = target;
  const isDelay = kind === "delay";

  const handleSave = async () => {
    if (saving) return;
    const asksForValue = !isDelay && !!task.value_label;
    const trimmedValue = value.trim();
    if (asksForValue && !VALUE_PATTERN.test(trimmedValue)) {
      setError("Enter a number of 0 or more, with at most 2 decimal places.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const trimmedText = text.trim() || undefined;
      if (isDelay) {
        await kraTasksAPI.delay(task.id, trimmedText);
        toast.success("Marked as delayed");
      } else {
        await kraTasksAPI.complete(task.id, {
          note: trimmedText,
          value: asksForValue ? Number(trimmedValue) : undefined,
        });
        toast.success("Marked as completed");
      }
      onDone();
    } catch (err) {
      if (isKraConflict(err)) {
        onConflict();
      } else {
        setError(kraErrorMessage(err));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !saving) onClose(); }}>
      <DialogContent className="bg-white border-slate-200 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-slate-950">{isDelay ? "Mark as delayed" : "Mark as completed"}</DialogTitle>
          <DialogDescription className="text-slate-500">{task.title}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {!isDelay && task.value_label && (
            <div>
              <label htmlFor="kra-value" className="block text-sm font-semibold text-slate-700 mb-1.5">
                {task.value_label}
              </label>
              <input
                id="kra-value" type="number" min="0" step="0.01" inputMode="decimal"
                value={value} onChange={(e) => { setValue(e.target.value); setError(""); }}
                className={kraInputClass}
              />
            </div>
          )}
          <div>
            <label htmlFor="kra-text" className="block text-sm font-semibold text-slate-700 mb-1.5">
              {isDelay ? "Reason (optional)" : "Note (optional)"}
            </label>
            <textarea
              id="kra-text" rows={3} value={text} onChange={(e) => setText(e.target.value)}
              className={`${kraInputClass} resize-none`}
            />
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}
        </div>
        <DialogFooter>
          <button onClick={onClose} disabled={saving} className={kraSecondaryButtonClass}>Cancel</button>
          <button onClick={handleSave} disabled={saving} className={kraPrimaryButtonClass}>
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isDelay ? "Mark delayed" : "Mark completed"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TaskCard({ task, onAction }: { task: KraOccurrence; onAction: (target: DialogTarget) => void }) {
  const isCompleted = task.status === "completed";
  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 space-y-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-950 break-words">{task.title}</h3>
          <KraPeriodLabel frequency={task.frequency} periodStart={task.period_start} periodEnd={task.period_end} />
        </div>
        <KraStatusBadge status={task.display_status} />
      </div>

      {task.description && <p className="text-sm text-slate-600 whitespace-pre-wrap break-words">{task.description}</p>}

      {!isCompleted && task.value_label && (
        <p className="flex items-center gap-1.5 text-xs text-slate-600">
          <Hash className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          Asks for a number when you complete it: {task.value_label}
        </p>
      )}

      {task.delay_reason && (
        <p className="text-sm text-slate-600 break-words">
          <span className="font-medium text-slate-700">Delay reason:</span> {task.delay_reason}
        </p>
      )}

      {isCompleted && (
        <dl className="text-sm text-slate-600 space-y-1">
          {task.completed_at && (
            <div className="flex gap-1.5">
              <dt className="font-medium text-slate-700">Completed:</dt>
              <dd>{formatServerTime(task.completed_at)}</dd>
            </div>
          )}
          {task.completion_value != null && (
            <div className="flex gap-1.5">
              <dt className="font-medium text-slate-700">{task.value_label ?? "Number"}:</dt>
              <dd>{task.completion_value.toLocaleString("en-IN")}</dd>
            </div>
          )}
          {task.completion_note && (
            <div className="flex gap-1.5">
              <dt className="font-medium text-slate-700">Note:</dt>
              <dd className="break-words min-w-0">{task.completion_note}</dd>
            </div>
          )}
        </dl>
      )}

      {!isCompleted && (
        <div className="flex flex-wrap gap-2 pt-1">
          {task.status === "pending" && (
            <button onClick={() => onAction({ kind: "delay", task })} className={kraSecondaryButtonClass}>
              <Hourglass className="w-4 h-4" /> Mark delayed
            </button>
          )}
          <button onClick={() => onAction({ kind: "complete", task })} className={kraPrimaryButtonClass}>
            <CheckCircle2 className="w-4 h-4" /> Mark completed
          </button>
        </div>
      )}
    </div>
  );
}

export default function MyKras() {
  const [tasks, setTasks] = useState<KraOccurrence[] | null>(null);
  const [error, setError] = useState("");
  const [target, setTarget] = useState<DialogTarget | null>(null);
  const hasLoaded = useRef(false);

  const load = useCallback(async () => {
    try {
      setTasks(await kraTasksAPI.myTasks(localDateString()));
      setError("");
      hasLoaded.current = true;
    } catch (err) {
      const message = kraErrorMessage(err, LOAD_ERRORS);
      // A failed refresh keeps the list on screen; only a first load shows the error
      if (hasLoaded.current) toast.error(message);
      else setError(message);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const byFrequency = useMemo(() => {
    const groups: Record<KraFrequency, KraOccurrence[]> = { daily: [], weekly: [], monthly: [], quarterly: [] };
    for (const task of tasks ?? []) groups[task.frequency].push(task);
    // Open work first. sort() is stable, so the server's newest-first order stays within each part
    for (const frequency of KRA_FREQUENCIES) {
      groups[frequency].sort((a, b) => Number(a.status === "completed") - Number(b.status === "completed"));
    }
    return groups;
  }, [tasks]);

  const openCount = (frequency: KraFrequency) =>
    byFrequency[frequency].filter((task) => task.status !== "completed").length;

  if (error) return <KraErrorState message={error} onRetry={() => { setError(""); setTasks(null); load(); }} />;
  if (tasks === null) return <KraLoading />;
  if (tasks.length === 0) {
    return (
      <KraEmptyState title="No KRAs assigned to you yet">
        Tasks appear here once your manager assigns them.
      </KraEmptyState>
    );
  }

  return (
    <>
      <Tabs defaultValue="daily" className="gap-4">
        <div className="overflow-x-auto">
          <TabsList className="h-10">
            {KRA_FREQUENCIES.map((frequency) => (
              <TabsTrigger key={frequency} value={frequency} className="px-3">
                {FREQUENCY_LABELS[frequency]}
                <span className="text-xs font-semibold" aria-label={`${openCount(frequency)} still open`}>
                  ({openCount(frequency)})
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {KRA_FREQUENCIES.map((frequency) => (
          <TabsContent key={frequency} value={frequency}>
            {byFrequency[frequency].length === 0 ? (
              <KraEmptyState title={`No ${FREQUENCY_LABELS[frequency].toLowerCase()} KRAs right now`} />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {byFrequency[frequency].map((task) => (
                  <TaskCard key={task.id} task={task} onAction={setTarget} />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <ActionDialog
        target={target}
        onClose={() => setTarget(null)}
        onDone={() => { setTarget(null); load(); }}
        onConflict={() => { setTarget(null); toast.info(KRA_CONFLICT_MESSAGE); load(); }}
      />
    </>
  );
}
