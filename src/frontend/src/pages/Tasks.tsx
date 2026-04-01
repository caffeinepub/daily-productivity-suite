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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  CheckSquare,
  ClipboardList,
  Loader2,
  Pencil,
  Plus,
  Tag,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Task } from "../backend";
import {
  useAddTask,
  useDeleteTask,
  useGetAllTasks,
  useToggleTask,
  useUpdateTask,
} from "../hooks/useQueries";

const PRIORITIES = ["high", "medium", "low"] as const;
type Priority = (typeof PRIORITIES)[number];
type FilterTab = "all" | "pending" | "completed";

const PRIORITY_COLORS: Record<Priority, string> = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-warning-muted text-warning-foreground border-warning/20",
  low: "bg-success-muted text-success border-success/20",
};

const EMPTY_FORM = {
  title: "",
  description: "",
  priority: "medium",
  dueDate: "",
  category: "",
};

export default function Tasks() {
  const { data: tasks = [], isLoading } = useGetAllTasks();
  const addTask = useAddTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const toggleTask = useToggleTask();

  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<bigint | null>(null);
  const [editingId, setEditingId] = useState<bigint | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");

  const pending = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed);

  const filtered = tasks.filter((t) => {
    const tabMatch =
      filterTab === "all" ||
      (filterTab === "pending" && !t.completed) ||
      (filterTab === "completed" && t.completed);
    const priorityMatch =
      filterPriority === "all" || t.priority === filterPriority;
    return tabMatch && priorityMatch;
  });

  const sorted = [...filtered].sort((a, b) => {
    const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
    return (order[a.priority] ?? 3) - (order[b.priority] ?? 3);
  });

  function openAdd() {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    setOpen(true);
  }

  function openEdit(task: Task) {
    setForm({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate,
      category: task.category,
    });
    setEditingId(task.id);
    setOpen(true);
  }

  async function handleSubmit() {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    try {
      if (editingId !== null) {
        await updateTask.mutateAsync({ id: editingId, ...form });
        toast.success("Task updated");
      } else {
        await addTask.mutateAsync(form);
        toast.success("Task added");
      }
      setOpen(false);
    } catch {
      toast.error("Something went wrong");
    }
  }

  async function handleDelete() {
    if (deleteId === null) return;
    try {
      await deleteTask.mutateAsync(deleteId);
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleteId(null);
    }
  }

  async function handleToggle(id: bigint) {
    try {
      await toggleTask.mutateAsync(id);
    } catch {
      toast.error("Failed to update task");
    }
  }

  const isSaving = addTask.isPending || updateTask.isPending;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-primary" />
            Task Manager
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Manage your tasks and stay productive
          </p>
        </div>
        <Button
          data-ocid="tasks.open_modal_button"
          onClick={openAdd}
          className="gap-2"
        >
          <Plus className="w-4 h-4" /> Add Task
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total", value: tasks.length, color: "text-foreground" },
          { label: "Pending", value: pending.length, color: "text-warning" },
          {
            label: "Completed",
            value: completed.length,
            color: "text-success",
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-card rounded-lg shadow-card border border-border p-4 text-center"
          >
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-muted-foreground text-sm mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Tabs
          value={filterTab}
          onValueChange={(v) => setFilterTab(v as FilterTab)}
        >
          <TabsList>
            <TabsTrigger data-ocid="tasks.filter.tab" value="all">
              All
            </TabsTrigger>
            <TabsTrigger data-ocid="tasks.filter.tab" value="pending">
              Pending
            </TabsTrigger>
            <TabsTrigger data-ocid="tasks.filter.tab" value="completed">
              Completed
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger data-ocid="tasks.priority.select" className="w-36">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Task list */}
      {isLoading ? (
        <div
          data-ocid="tasks.loading_state"
          className="flex justify-center items-center py-16"
        >
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : sorted.length === 0 ? (
        <div
          data-ocid="tasks.empty_state"
          className="bg-card border border-border rounded-lg shadow-card text-center py-16"
        >
          <ClipboardList className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-foreground font-medium">No tasks yet</p>
          <p className="text-muted-foreground text-sm mt-1 mb-4">
            Create your first task to get started
          </p>
          <Button variant="outline" onClick={openAdd} className="gap-2">
            <Plus className="w-4 h-4" /> Add your first task
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((task, idx) => (
            <div
              key={task.id.toString()}
              data-ocid={`tasks.item.${idx + 1}`}
              className={[
                "bg-card border border-border rounded-lg shadow-card px-4 py-3.5 flex items-start gap-3 transition-opacity",
                task.completed ? "opacity-60" : "",
              ].join(" ")}
            >
              <Checkbox
                data-ocid={`tasks.checkbox.${idx + 1}`}
                checked={task.completed}
                onCheckedChange={() => handleToggle(task.id)}
                className="mt-0.5 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={[
                      "font-medium text-sm",
                      task.completed
                        ? "line-through text-muted-foreground"
                        : "text-foreground",
                    ].join(" ")}
                  >
                    {task.title}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                      PRIORITY_COLORS[task.priority as Priority] ??
                      "bg-muted text-muted-foreground"
                    }`}
                  >
                    {task.priority}
                  </span>
                  {task.category && (
                    <Badge variant="outline" className="text-xs gap-1">
                      <Tag className="w-2.5 h-2.5" />
                      {task.category}
                    </Badge>
                  )}
                </div>
                {task.description && (
                  <p className="text-muted-foreground text-xs mt-1 line-clamp-1">
                    {task.description}
                  </p>
                )}
                {task.dueDate && (
                  <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    Due{" "}
                    {new Date(task.dueDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  data-ocid={`tasks.edit_button.${idx + 1}`}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => openEdit(task)}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  data-ocid={`tasks.delete_button.${idx + 1}`}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => setDeleteId(task.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-ocid="tasks.dialog" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId !== null ? "Edit Task" : "Add Task"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="task-title">Title</Label>
              <Input
                id="task-title"
                data-ocid="tasks.title.input"
                placeholder="Task title"
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-desc">Description</Label>
              <Textarea
                id="task-desc"
                data-ocid="tasks.description.textarea"
                placeholder="Optional description"
                rows={2}
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) => setForm((p) => ({ ...p, priority: v }))}
                >
                  <SelectTrigger data-ocid="tasks.priority.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="task-due">Due date</Label>
                <Input
                  id="task-due"
                  type="date"
                  data-ocid="tasks.duedate.input"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, dueDate: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-cat">Category</Label>
              <Input
                id="task-cat"
                data-ocid="tasks.category.input"
                placeholder="e.g. Work, Personal"
                value={form.category}
                onChange={(e) =>
                  setForm((p) => ({ ...p, category: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              data-ocid="tasks.cancel_button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="tasks.submit_button"
              onClick={handleSubmit}
              disabled={isSaving}
            >
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingId !== null ? "Save changes" : "Add task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent data-ocid="tasks.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="tasks.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="tasks.delete_button"
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteTask.isPending ? (
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
