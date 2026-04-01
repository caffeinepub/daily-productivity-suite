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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Circle,
  Flame,
  Loader2,
  Pencil,
  Plus,
  Repeat2,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Habit, HabitLog } from "../backend";
import {
  useAddHabit,
  useDeleteHabit,
  useGetAllHabits,
  useGetHabitLogs,
  useLogHabit,
  useUpdateHabit,
} from "../hooks/useQueries";

const TODAY = new Date().toISOString().split("T")[0];

function calculateStreak(logs: HabitLog[]): number {
  if (logs.length === 0) return 0;
  const dates = new Set(logs.map((l) => l.date));
  let streak = 0;
  const current = new Date();
  while (true) {
    const dateStr = current.toISOString().split("T")[0];
    if (dates.has(dateStr)) {
      streak++;
      current.setDate(current.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function MonthCalendar({ logs }: { logs: HabitLog[] }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const loggedDates = new Set(logs.map((l) => l.date));
  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Build cells as stable string keys: "pad-0".."pad-N" for empty, "YYYY-MM-DD" for days
  const padCells = Array.from({ length: firstDay }, (_, i) => `pad-${i}`);
  const dayCells = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  });
  const cells = [...padCells, ...dayCells];

  return (
    <div className="mt-3">
      <div className="grid grid-cols-7 gap-0.5">
        {weekDays.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] text-muted-foreground pb-1"
          >
            {d}
          </div>
        ))}
        {cells.map((cell) => {
          if (cell.startsWith("pad-")) {
            return <div key={cell} />;
          }
          const day = Number.parseInt(cell.split("-")[2], 10);
          const logged = loggedDates.has(cell);
          const isToday = cell === TODAY;
          return (
            <div
              key={cell}
              title={cell}
              className={[
                "w-6 h-6 rounded-full mx-auto flex items-center justify-center text-[10px] font-medium transition-colors",
                logged
                  ? "bg-success text-white"
                  : isToday
                    ? "ring-1 ring-primary text-foreground"
                    : "text-muted-foreground/60",
              ].join(" ")}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface HabitCardProps {
  habit: Habit;
  index: number;
  onEdit: (h: Habit) => void;
  onDelete: (id: bigint) => void;
}

function HabitCard({ habit, index, onEdit, onDelete }: HabitCardProps) {
  const { data: logs = [], isLoading } = useGetHabitLogs(habit.id);
  const logHabit = useLogHabit();

  const checkedToday = logs.some((l) => l.date === TODAY);
  const streak = calculateStreak(logs);

  async function handleCheckIn() {
    if (checkedToday) return;
    try {
      await logHabit.mutateAsync({ habitId: habit.id, date: TODAY });
      toast.success(`${habit.emoji} ${habit.name} checked in!`);
    } catch {
      toast.error("Failed to log habit");
    }
  }

  return (
    <div
      data-ocid={`habits.item.${index}`}
      className="bg-card border border-border rounded-xl shadow-card p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl leading-none">{habit.emoji}</span>
          <div>
            <p className="font-semibold text-foreground text-sm">
              {habit.name}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Flame className="w-3 h-3 text-orange-400" />
              <span className="text-xs text-muted-foreground">
                {streak} day{streak !== 1 ? "s" : ""} streak
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            data-ocid={`habits.edit_button.${index}`}
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => onEdit(habit)}
          >
            <Pencil className="w-3 h-3" />
          </Button>
          <Button
            data-ocid={`habits.delete_button.${index}`}
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(habit.id)}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-3 flex justify-center">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <MonthCalendar logs={logs} />
      )}

      <Button
        data-ocid={`habits.checkin.button.${index}`}
        variant={checkedToday ? "secondary" : "default"}
        size="sm"
        className="mt-3 w-full gap-2"
        onClick={handleCheckIn}
        disabled={checkedToday || logHabit.isPending}
      >
        {logHabit.isPending ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : checkedToday ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-success" />
        ) : (
          <Circle className="w-3.5 h-3.5" />
        )}
        {checkedToday ? "Checked in today" : "Check in today"}
      </Button>
    </div>
  );
}

export default function Habits() {
  const { data: habits = [], isLoading } = useGetAllHabits();
  const addHabit = useAddHabit();
  const updateHabit = useUpdateHabit();
  const deleteHabit = useDeleteHabit();

  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<bigint | null>(null);
  const [editingId, setEditingId] = useState<bigint | null>(null);
  const [form, setForm] = useState({ name: "", emoji: "✅" });

  function openAdd() {
    setForm({ name: "", emoji: "✅" });
    setEditingId(null);
    setOpen(true);
  }

  function openEdit(habit: Habit) {
    setForm({ name: habit.name, emoji: habit.emoji });
    setEditingId(habit.id);
    setOpen(true);
  }

  async function handleSubmit() {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      if (editingId !== null) {
        await updateHabit.mutateAsync({ id: editingId, ...form });
        toast.success("Habit updated");
      } else {
        await addHabit.mutateAsync(form);
        toast.success("Habit created");
      }
      setOpen(false);
    } catch {
      toast.error("Something went wrong");
    }
  }

  async function handleDelete() {
    if (deleteId === null) return;
    try {
      await deleteHabit.mutateAsync(deleteId);
      toast.success("Habit deleted");
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleteId(null);
    }
  }

  const isSaving = addHabit.isPending || updateHabit.isPending;

  const monthName = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Repeat2 className="w-6 h-6 text-success" />
            Habit Tracker
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">{monthName}</p>
        </div>
        <Button
          data-ocid="habits.open_modal_button"
          onClick={openAdd}
          className="gap-2"
        >
          <Plus className="w-4 h-4" /> Add Habit
        </Button>
      </div>

      {/* Today completion bar */}
      {habits.length > 0 && (
        <div className="bg-card border border-border rounded-xl shadow-card p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              Today&apos;s Progress
            </span>
            <span className="text-xs text-muted-foreground">
              {habits.length} habit{habits.length !== 1 ? "s" : ""}
            </span>
          </div>
          <Progress value={0} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1.5">
            Check in to your habits to track today&apos;s progress
          </p>
        </div>
      )}

      {/* Habit grid */}
      {isLoading ? (
        <div
          data-ocid="habits.loading_state"
          className="flex justify-center py-16"
        >
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : habits.length === 0 ? (
        <div
          data-ocid="habits.empty_state"
          className="bg-card border border-border rounded-xl shadow-card text-center py-16"
        >
          <Repeat2 className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-foreground font-medium">No habits yet</p>
          <p className="text-muted-foreground text-sm mt-1 mb-4">
            Start building positive daily habits
          </p>
          <Button variant="outline" onClick={openAdd} className="gap-2">
            <Plus className="w-4 h-4" /> Create your first habit
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {habits.map((habit, i) => (
            <HabitCard
              key={habit.id.toString()}
              habit={habit}
              index={i + 1}
              onEdit={openEdit}
              onDelete={(id) => setDeleteId(id)}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-ocid="habits.dialog" className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {editingId !== null ? "Edit Habit" : "New Habit"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="habit-emoji">Emoji</Label>
              <Input
                id="habit-emoji"
                data-ocid="habits.emoji.input"
                placeholder="e.g. 💧"
                value={form.emoji}
                maxLength={4}
                onChange={(e) =>
                  setForm((p) => ({ ...p, emoji: e.target.value }))
                }
                className="text-2xl w-20"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="habit-name">Name</Label>
              <Input
                id="habit-name"
                data-ocid="habits.name.input"
                placeholder="e.g. Drink 8 glasses of water"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              data-ocid="habits.cancel_button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="habits.submit_button"
              onClick={handleSubmit}
              disabled={isSaving}
            >
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingId !== null ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete habit?</AlertDialogTitle>
            <AlertDialogDescription>
              All check-in history will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="habits.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="habits.delete_button"
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteHabit.isPending ? (
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
