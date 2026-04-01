import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Task {
    id: bigint;
    title: string;
    createdAt: bigint;
    completed: boolean;
    dueDate: string;
    description: string;
    category: string;
    priority: string;
}
export interface Habit {
    id: bigint;
    name: string;
    emoji: string;
}
export interface HabitLog {
    date: string;
    habitId: bigint;
}
export interface JournalEntry {
    id: bigint;
    title: string;
    body: string;
    date: string;
    createdAt: bigint;
    updatedAt: bigint;
}
export interface Transaction {
    id: bigint;
    date: string;
    note: string;
    createdAt: bigint;
    type: string;
    category: string;
    amount: number;
}
export interface backendInterface {
    addHabit(name: string, emoji: string): Promise<bigint>;
    addJournalEntry(title: string, body: string, date: string): Promise<bigint>;
    addTask(title: string, description: string, priority: string, dueDate: string, category: string): Promise<bigint>;
    addTransaction(type: string, category: string, amount: number, date: string, note: string): Promise<bigint>;
    deleteHabit(id: bigint): Promise<void>;
    deleteJournalEntry(id: bigint): Promise<void>;
    deleteTask(id: bigint): Promise<void>;
    deleteTransaction(id: bigint): Promise<void>;
    getAllHabits(): Promise<Array<Habit>>;
    getAllJournalEntries(): Promise<Array<JournalEntry>>;
    getAllTasks(): Promise<Array<Task>>;
    getAllTransactions(): Promise<Array<Transaction>>;
    getHabitLogs(habitId: bigint): Promise<Array<HabitLog>>;
    logHabit(habitId: bigint, date: string): Promise<void>;
    toggleTaskComplete(id: bigint): Promise<void>;
    updateHabit(id: bigint, name: string, emoji: string): Promise<void>;
    updateJournalEntry(id: bigint, title: string, body: string, date: string): Promise<void>;
    updateTask(id: bigint, title: string, description: string, priority: string, dueDate: string, category: string): Promise<void>;
    updateTransaction(id: bigint, type: string, category: string, amount: number, date: string, note: string): Promise<void>;
}
