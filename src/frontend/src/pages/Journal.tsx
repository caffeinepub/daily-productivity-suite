import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  ChevronLeft,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { JournalEntry } from "../backend";
import {
  useAddJournalEntry,
  useDeleteJournalEntry,
  useGetAllJournalEntries,
  useUpdateJournalEntry,
} from "../hooks/useQueries";

const TODAY = new Date().toISOString().split("T")[0];

function shortDate(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function Journal() {
  const { data: entries = [], isLoading } = useGetAllJournalEntries();
  const addEntry = useAddJournalEntry();
  const updateEntry = useUpdateJournalEntry();
  const deleteEntry = useDeleteJournalEntry();

  const [view, setView] = useState<"list" | "editor">("list");
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [form, setForm] = useState({ title: "", body: "", date: TODAY });
  const [deleteId, setDeleteId] = useState<bigint | null>(null);

  const sorted = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  function openNew() {
    setForm({ title: "", body: "", date: TODAY });
    setEditingEntry(null);
    setView("editor");
  }

  function openEdit(entry: JournalEntry) {
    setForm({ title: entry.title, body: entry.body, date: entry.date });
    setEditingEntry(entry);
    setView("editor");
  }

  function cancelEdit() {
    setView("list");
    setEditingEntry(null);
  }

  async function handleSave() {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    try {
      if (editingEntry) {
        await updateEntry.mutateAsync({ id: editingEntry.id, ...form });
        toast.success("Entry updated");
      } else {
        await addEntry.mutateAsync(form);
        toast.success("Entry saved");
      }
      setView("list");
      setEditingEntry(null);
    } catch {
      toast.error("Failed to save entry");
    }
  }

  async function handleDelete() {
    if (deleteId === null) return;
    try {
      await deleteEntry.mutateAsync(deleteId);
      toast.success("Entry deleted");
      if (editingEntry?.id === deleteId) {
        setView("list");
        setEditingEntry(null);
      }
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleteId(null);
    }
  }

  const isSaving = addEntry.isPending || updateEntry.isPending;

  // ── Editor view ──────────────────────────────────────────────────────────────
  if (view === "editor") {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={cancelEdit}
            className="gap-1.5 text-muted-foreground"
          >
            <ChevronLeft className="w-4 h-4" />
            All entries
          </Button>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-card p-6 md:p-8">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="entry-date">Date</Label>
              <Input
                id="entry-date"
                type="date"
                data-ocid="journal.date.input"
                value={form.date}
                onChange={(e) =>
                  setForm((p) => ({ ...p, date: e.target.value }))
                }
                className="w-44"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="entry-title">Title</Label>
              <Input
                id="entry-title"
                data-ocid="journal.title.input"
                placeholder="Give your entry a title…"
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                className="text-lg font-semibold border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="entry-body">Entry</Label>
              <Textarea
                id="entry-body"
                data-ocid="journal.editor"
                placeholder="Write freely… what's on your mind today?"
                value={form.body}
                onChange={(e) =>
                  setForm((p) => ({ ...p, body: e.target.value }))
                }
                rows={14}
                className="resize-none text-base leading-relaxed border-0 rounded-none px-0 focus-visible:ring-0"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
            <div className="flex gap-2">
              {editingEntry && (
                <Button
                  data-ocid="journal.delete_button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive gap-1.5"
                  onClick={() => setDeleteId(editingEntry.id)}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                data-ocid="journal.cancel_button"
                variant="outline"
                onClick={cancelEdit}
              >
                Cancel
              </Button>
              <Button
                data-ocid="journal.save_button"
                onClick={handleSave}
                disabled={isSaving}
                className="gap-2"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isSaving ? "Saving…" : "Save entry"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── List view ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            Daily Journal
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {entries.length} entr{entries.length !== 1 ? "ies" : "y"}
          </p>
        </div>
        <Button
          data-ocid="journal.open_modal_button"
          onClick={openNew}
          className="gap-2"
        >
          <Plus className="w-4 h-4" /> New Entry
        </Button>
      </div>

      {isLoading ? (
        <div
          data-ocid="journal.loading_state"
          className="flex justify-center py-16"
        >
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : sorted.length === 0 ? (
        <div
          data-ocid="journal.empty_state"
          className="bg-card border border-border rounded-xl shadow-card text-center py-16"
        >
          <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-foreground font-medium">No journal entries yet</p>
          <p className="text-muted-foreground text-sm mt-1 mb-4">
            Start writing — just a few words a day makes a difference
          </p>
          <Button variant="outline" onClick={openNew} className="gap-2">
            <Plus className="w-4 h-4" /> Write your first entry
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((entry, idx) => (
            <div
              key={entry.id.toString()}
              data-ocid={`journal.item.${idx + 1}`}
              className="bg-card border border-border rounded-xl shadow-card p-4 hover:shadow-card-hover transition-shadow group"
            >
              <div className="flex items-start justify-between gap-4">
                <button
                  type="button"
                  className="flex-1 min-w-0 text-left"
                  onClick={() => openEdit(entry)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground font-medium">
                      {shortDate(entry.date)}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground text-sm leading-snug">
                    {entry.title}
                  </h3>
                  {entry.body && (
                    <p className="text-muted-foreground text-xs mt-1 line-clamp-2 leading-relaxed">
                      {entry.body}
                    </p>
                  )}
                </button>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <Button
                    data-ocid={`journal.edit_button.${idx + 1}`}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => openEdit(entry)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    data-ocid={`journal.delete_button.${idx + 1}`}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleteId(entry.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This journal entry will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="journal.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="journal.confirm_button"
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteEntry.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
