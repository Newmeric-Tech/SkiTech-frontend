"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Hash, Loader2, Pencil, Plus, Search, UserPlus, X } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  KRA_FREQUENCIES, KraAssignment, KraDefinition, KraDefinitionUpdate, KraFrequency,
  isKraConflict, kraErrorMessage, kraTasksAPI,
} from "@/lib/api/kraTasks";
import { localDateString } from "@/lib/utils/localDate";
import { FREQUENCY_LABELS, KraFrequencyLabel } from "./KraLabels";
import {
  KraEmptyState, KraErrorState, KraLoading,
  kraInputClass, kraPrimaryButtonClass, kraSecondaryButtonClass,
} from "./KraPanelStates";
import { useKraPeople } from "./useKraPeople";

const dialogClass = "bg-white border-slate-200 rounded-2xl max-h-[90vh] overflow-y-auto";
const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";
const errorClass = "text-sm text-red-600 dark:text-red-400";

// ── New / Edit ──────────────────────────────────────────────
function DefinitionDialog({ propertyId, definition, wasAssigned, onClose, onSaved }: {
  propertyId: string;
  definition: KraDefinition | null; // null = new
  wasAssigned: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(definition?.title ?? "");
  const [description, setDescription] = useState(definition?.description ?? "");
  const [frequency, setFrequency] = useState<KraFrequency>(definition?.frequency ?? "daily");
  const [asksForNumber, setAsksForNumber] = useState(!!definition?.value_label);
  const [valueLabel, setValueLabel] = useState(definition?.value_label ?? "");
  const [isActive, setIsActive] = useState(definition?.is_active ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (saving) return;
    const cleanTitle = title.trim();
    const cleanLabel = asksForNumber ? valueLabel.trim() : "";
    if (!cleanTitle) { setError("Enter a title."); return; }
    if (asksForNumber && !cleanLabel) { setError("Enter a label for the number, or untick the box."); return; }

    const cleanDescription = description.trim() || null;
    const label = cleanLabel || null;
    setSaving(true);
    setError("");
    try {
      if (definition) {
        // Only what changed, so an unchanged frequency can't answer 409
        const changes: KraDefinitionUpdate = {};
        if (cleanTitle !== definition.title) changes.title = cleanTitle;
        if (cleanDescription !== definition.description) changes.description = cleanDescription;
        if (label !== definition.value_label) changes.value_label = label;
        if (isActive !== definition.is_active) changes.is_active = isActive;
        if (frequency !== definition.frequency) changes.frequency = frequency;
        if (Object.keys(changes).length > 0) await kraTasksAPI.updateDefinition(definition.id, changes);
        toast.success("KRA updated");
      } else {
        await kraTasksAPI.createDefinition({
          property_id: propertyId, title: cleanTitle, description: cleanDescription, frequency, value_label: label,
        });
        toast.success("KRA created");
      }
      onSaved();
    } catch (err) {
      setError(kraErrorMessage(err, { 409: "The frequency can't change once this KRA has been assigned to someone." }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !saving) onClose(); }}>
      <DialogContent className={dialogClass}>
        <DialogHeader>
          <DialogTitle className="text-slate-950">{definition ? "Edit KRA" : "New KRA"}</DialogTitle>
          <DialogDescription className="text-slate-500">
            {definition ? "Changes also show on tasks already created." : "Assign it to people once it is created."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label htmlFor="kra-title" className={labelClass}>Title</label>
            <input id="kra-title" maxLength={200} value={title} onChange={(e) => { setTitle(e.target.value); setError(""); }}
              className={kraInputClass} />
          </div>
          <div>
            <label htmlFor="kra-description" className={labelClass}>Description (optional)</label>
            <textarea id="kra-description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)}
              className={`${kraInputClass} resize-none`} />
          </div>
          <div>
            <label htmlFor="kra-frequency" className={labelClass}>Frequency</label>
            <select id="kra-frequency" value={frequency} disabled={wasAssigned}
              onChange={(e) => { setFrequency(e.target.value as KraFrequency); setError(""); }}
              className={`${kraInputClass} disabled:opacity-60`}>
              {KRA_FREQUENCIES.map((f) => <option key={f} value={f}>{FREQUENCY_LABELS[f]}</option>)}
            </select>
            {wasAssigned && <p className="text-xs text-slate-500 mt-1">The frequency can&apos;t change once a KRA has been assigned.</p>}
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
              <input type="checkbox" checked={asksForNumber} onChange={(e) => { setAsksForNumber(e.target.checked); setError(""); }} />
              Ask for a number when completing
            </label>
            {asksForNumber && (
              <div>
                <label htmlFor="kra-label" className={labelClass}>Label for the number</label>
                <input id="kra-label" maxLength={100} value={valueLabel} placeholder="e.g. Cash deposited (₹)"
                  onChange={(e) => { setValueLabel(e.target.value); setError(""); }} className={kraInputClass} />
              </div>
            )}
          </div>
          {definition && (
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                Active
              </label>
              <p className="text-xs text-slate-500 mt-1">
                While inactive, no new periods are created. When turned back on, tasks restart from today and the gap doesn&apos;t count as missed.
              </p>
            </div>
          )}
          {error && <p className={errorClass} role="alert">{error}</p>}
        </div>
        <DialogFooter>
          <button onClick={onClose} disabled={saving} className={kraSecondaryButtonClass}>Cancel</button>
          <button onClick={handleSave} disabled={saving} className={kraPrimaryButtonClass}>
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Assign ──────────────────────────────────────────────────
function AssignDialog({ definition, propertyId, canAssignManagers, activeAssigneeIds, onClose, onSaved }: {
  definition: KraDefinition;
  propertyId: string;
  canAssignManagers: boolean;
  activeAssigneeIds: Set<string>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { people, error: peopleError, reload } = useKraPeople(propertyId);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // A deactivated account can't be assigned, and one in the request fails all of it
  const eligible = useMemo(
    () => (people ?? []).filter((p) => p.isActive && (canAssignManagers || p.role === "Staff")),
    [people, canAssignManagers]
  );
  const shown = eligible.filter((p) => p.name.toLowerCase().includes(search.trim().toLowerCase()));

  const toggle = (id: string) => {
    setError("");
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    if (saving || selected.size === 0) return;
    setSaving(true);
    setError("");
    try {
      const result = await kraTasksAPI.assign(definition.id, [...selected], localDateString());
      if (result.created.length > 0) {
        toast.success(`Assigned to ${result.created.length} ${result.created.length === 1 ? "person" : "people"}`);
      }
      if (result.skipped_user_ids.length > 0) {
        const names = result.skipped_user_ids.map((id) => eligible.find((p) => p.id === id)?.name ?? "Someone");
        toast.info(`Already assigned, so skipped: ${names.join(", ")}`);
      }
      onSaved();
    } catch (err) {
      setError(kraErrorMessage(err, {
        403: "One of these people can't be assigned this KRA. Nothing was saved.",
        404: "One of these people can't be assigned this KRA. Nothing was saved.",
        409: "This KRA is inactive, so it can't be assigned. Turn it on first.",
        422: "Your device's date looks wrong. Please check it and try again.",
      }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !saving) onClose(); }}>
      <DialogContent className={dialogClass}>
        <DialogHeader>
          <DialogTitle className="text-slate-950">Assign KRA</DialogTitle>
          <DialogDescription className="text-slate-500">{definition.title}</DialogDescription>
        </DialogHeader>
        {peopleError ? (
          <KraErrorState message={peopleError} onRetry={reload} />
        ) : people === null ? (
          <KraLoading />
        ) : eligible.length === 0 ? (
          <KraEmptyState title={canAssignManagers ? "No staff or managers in this property yet" : "No staff in this property yet"} />
        ) : (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input aria-label="Search people" placeholder="Search by name" value={search}
                onChange={(e) => setSearch(e.target.value)} className={`${kraInputClass} pl-9`} />
            </div>
            <ul className="max-h-64 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
              {shown.length === 0 && <li className="px-3 py-4 text-sm text-slate-500 text-center">Nobody matches that search.</li>}
              {shown.map((person) => {
                const already = activeAssigneeIds.has(person.id);
                return (
                  <li key={person.id}>
                    <label className={`flex items-center gap-3 px-3 py-2.5 text-sm ${already ? "opacity-60" : "cursor-pointer hover:bg-slate-50"}`}>
                      <input type="checkbox" disabled={already} checked={already || selected.has(person.id)}
                        onChange={() => toggle(person.id)} />
                      <span className="min-w-0 flex-1 truncate text-slate-900">{person.name}</span>
                      {canAssignManagers && <span className="text-xs text-slate-500">{person.role}</span>}
                      {already && <span className="text-xs font-medium text-slate-500">Already assigned</span>}
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        {error && <p className={errorClass} role="alert">{error}</p>}
        <DialogFooter>
          <button onClick={onClose} disabled={saving} className={kraSecondaryButtonClass}>Cancel</button>
          <button onClick={handleSave} disabled={saving || selected.size === 0} className={kraPrimaryButtonClass}>
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Assign{selected.size > 0 ? ` (${selected.size})` : ""}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Remove ──────────────────────────────────────────────────
function RemoveDialog({ assignment, definitionTitle, onClose, onRemoved }: {
  assignment: KraAssignment;
  definitionTitle: string;
  onClose: () => void;
  onRemoved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleRemove = async () => {
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      await kraTasksAPI.endAssignment(assignment.id);
      toast.success("Assignment removed");
      onRemoved();
    } catch (err) {
      if (isKraConflict(err)) {
        toast.info("This assignment had already ended. Refreshing.");
        onRemoved();
      } else {
        setError(kraErrorMessage(err));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !saving) onClose(); }}>
      <DialogContent className={dialogClass}>
        <DialogHeader>
          <DialogTitle className="text-slate-950">Remove {assignment.assignee_name ?? "this person"}?</DialogTitle>
          <DialogDescription className="text-slate-500">
            They stop getting new periods of &quot;{definitionTitle}&quot;. Tasks already created keep their history.
          </DialogDescription>
        </DialogHeader>
        {error && <p className={errorClass} role="alert">{error}</p>}
        <DialogFooter>
          <button onClick={onClose} disabled={saving} className={kraSecondaryButtonClass}>Cancel</button>
          <button onClick={handleRemove} disabled={saving} className={kraPrimaryButtonClass}>
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Remove
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Panel ───────────────────────────────────────────────────
type OpenDialog =
  | { kind: "new" }
  | { kind: "edit"; definition: KraDefinition }
  | { kind: "assign"; definition: KraDefinition }
  | { kind: "remove"; assignment: KraAssignment; definitionTitle: string };

/** Render with key={propertyId}: state belongs to one property */
export default function KraTasksPanel({ propertyId, canAssignManagers }: {
  propertyId: string;
  canAssignManagers: boolean;
}) {
  const [definitions, setDefinitions] = useState<KraDefinition[] | null>(null);
  const [assignments, setAssignments] = useState<KraAssignment[]>([]);
  const [error, setError] = useState("");
  const [dialog, setDialog] = useState<OpenDialog | null>(null);
  const hasLoaded = useRef(false);

  const load = useCallback(async () => {
    try {
      // One assignments call for all, grouped below, rather than one per definition
      const [definitionRows, assignmentRows] = await Promise.all([
        kraTasksAPI.listDefinitions(propertyId),
        kraTasksAPI.listAssignments(),
      ]);
      setDefinitions(definitionRows);
      setAssignments(assignmentRows);
      setError("");
      hasLoaded.current = true;
    } catch (err) {
      if (hasLoaded.current) toast.error(kraErrorMessage(err));
      else setError(kraErrorMessage(err));
    }
  }, [propertyId]);

  useEffect(() => { load(); }, [load]);

  const assignmentsFor = useCallback(
    (definitionId: string) => assignments.filter((a) => a.definition_id === definitionId),
    [assignments]
  );

  const closeAndReload = () => { setDialog(null); load(); };

  if (error) return <KraErrorState message={error} onRetry={() => { setError(""); load(); }} />;
  if (definitions === null) return <KraLoading />;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setDialog({ kind: "new" })} className={kraPrimaryButtonClass}>
          <Plus className="w-4 h-4" /> New KRA
        </button>
      </div>

      {definitions.length === 0 ? (
        <KraEmptyState title="No KRAs yet">Create one, then assign it to your team.</KraEmptyState>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {definitions.map((definition) => {
            const active = assignmentsFor(definition.id).filter((a) => a.is_active);
            return (
              <div key={definition.id} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 space-y-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-950 break-words">{definition.title}</h3>
                    <div className="flex items-center gap-2 flex-wrap mt-0.5">
                      <KraFrequencyLabel frequency={definition.frequency} />
                      <span className="text-xs text-slate-500">· {active.length} assigned</span>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                    definition.is_active
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800"
                      : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}>
                    {definition.is_active ? "Active" : "Inactive"}
                  </span>
                </div>

                {definition.description && (
                  <p className="text-sm text-slate-600 whitespace-pre-wrap break-words">{definition.description}</p>
                )}
                {definition.value_label && (
                  <p className="flex items-center gap-1.5 text-xs text-slate-600">
                    <Hash className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    Asks for number: {definition.value_label}
                  </p>
                )}

                {active.length > 0 && (
                  <ul className="flex flex-wrap gap-2">
                    {active.map((assignment) => (
                      <li key={assignment.id} className="inline-flex items-center gap-1.5 pl-3 pr-1 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-700 max-w-full">
                        <span className="truncate">{assignment.assignee_name ?? "Unnamed"}</span>
                        <button
                          onClick={() => setDialog({ kind: "remove", assignment, definitionTitle: definition.title })}
                          aria-label={`Remove ${assignment.assignee_name ?? "this person"}`}
                          className="w-5 h-5 flex-shrink-0 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100">
                          <X className="w-3 h-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex flex-wrap gap-2 pt-1">
                  <button onClick={() => setDialog({ kind: "edit", definition })} className={kraSecondaryButtonClass}>
                    <Pencil className="w-4 h-4" /> Edit
                  </button>
                  {definition.is_active && (
                    <button onClick={() => setDialog({ kind: "assign", definition })} className={kraSecondaryButtonClass}>
                      <UserPlus className="w-4 h-4" /> Assign
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {dialog?.kind === "new" && (
        <DefinitionDialog propertyId={propertyId} definition={null} wasAssigned={false}
          onClose={() => setDialog(null)} onSaved={closeAndReload} />
      )}
      {dialog?.kind === "edit" && (
        <DefinitionDialog propertyId={propertyId} definition={dialog.definition}
          wasAssigned={assignmentsFor(dialog.definition.id).length > 0}
          onClose={() => setDialog(null)} onSaved={closeAndReload} />
      )}
      {dialog?.kind === "assign" && (
        <AssignDialog definition={dialog.definition} propertyId={propertyId} canAssignManagers={canAssignManagers}
          activeAssigneeIds={new Set(assignmentsFor(dialog.definition.id).filter((a) => a.is_active).map((a) => a.assignee_id))}
          onClose={() => setDialog(null)} onSaved={closeAndReload} />
      )}
      {dialog?.kind === "remove" && (
        <RemoveDialog assignment={dialog.assignment} definitionTitle={dialog.definitionTitle}
          onClose={() => setDialog(null)} onRemoved={closeAndReload} />
      )}
    </div>
  );
}
