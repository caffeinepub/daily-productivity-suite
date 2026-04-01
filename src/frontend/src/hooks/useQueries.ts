import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Habit,
  HabitLog,
  JournalEntry,
  Task,
  Transaction,
} from "../backend";
import { useActor } from "./useActor";

// ─── Tasks ────────────────────────────────────────────────────────────────────

export function useGetAllTasks() {
  const { actor, isFetching } = useActor();
  return useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTasks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: {
      title: string;
      description: string;
      priority: string;
      dueDate: string;
      category: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addTask(
        d.title,
        d.description,
        d.priority,
        d.dueDate,
        d.category,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useUpdateTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: {
      id: bigint;
      title: string;
      description: string;
      priority: string;
      dueDate: string;
      category: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateTask(
        d.id,
        d.title,
        d.description,
        d.priority,
        d.dueDate,
        d.category,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useDeleteTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteTask(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useToggleTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.toggleTaskComplete(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

// ─── Habits ───────────────────────────────────────────────────────────────────

export function useGetAllHabits() {
  const { actor, isFetching } = useActor();
  return useQuery<Habit[]>({
    queryKey: ["habits"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllHabits();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetHabitLogs(habitId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<HabitLog[]>({
    queryKey: ["habitLogs", habitId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getHabitLogs(habitId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddHabit() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: { name: string; emoji: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addHabit(d.name, d.emoji);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["habits"] }),
  });
}

export function useUpdateHabit() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: { id: bigint; name: string; emoji: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateHabit(d.id, d.name, d.emoji);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["habits"] }),
  });
}

export function useDeleteHabit() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteHabit(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["habits"] }),
  });
}

export function useLogHabit() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: { habitId: bigint; date: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.logHabit(d.habitId, d.date);
    },
    onSuccess: (_r, vars) => {
      qc.invalidateQueries({
        queryKey: ["habitLogs", vars.habitId.toString()],
      });
    },
  });
}

// ─── Journal ──────────────────────────────────────────────────────────────────

export function useGetAllJournalEntries() {
  const { actor, isFetching } = useActor();
  return useQuery<JournalEntry[]>({
    queryKey: ["journal"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllJournalEntries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddJournalEntry() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: { title: string; body: string; date: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addJournalEntry(d.title, d.body, d.date);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["journal"] }),
  });
}

export function useUpdateJournalEntry() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: {
      id: bigint;
      title: string;
      body: string;
      date: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateJournalEntry(d.id, d.title, d.body, d.date);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["journal"] }),
  });
}

export function useDeleteJournalEntry() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteJournalEntry(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["journal"] }),
  });
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export function useGetAllTransactions() {
  const { actor, isFetching } = useActor();
  return useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTransactions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddTransaction() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: {
      type: string;
      category: string;
      amount: number;
      date: string;
      note: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addTransaction(d.type, d.category, d.amount, d.date, d.note);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
  });
}

export function useUpdateTransaction() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: {
      id: bigint;
      type: string;
      category: string;
      amount: number;
      date: string;
      note: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateTransaction(
        d.id,
        d.type,
        d.category,
        d.amount,
        d.date,
        d.note,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
  });
}

export function useDeleteTransaction() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteTransaction(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
  });
}
