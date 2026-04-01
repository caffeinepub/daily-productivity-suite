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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Car,
  ChevronLeft,
  ChevronRight,
  FileText,
  Heart,
  Loader2,
  Music,
  Pencil,
  Plus,
  Receipt,
  Scale,
  ShoppingBag,
  Tag,
  Trash2,
  TrendingDown,
  TrendingUp,
  Utensils,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Transaction } from "../backend";
import {
  useAddTransaction,
  useDeleteTransaction,
  useGetAllTransactions,
  useUpdateTransaction,
} from "../hooks/useQueries";

const TODAY = new Date().toISOString().split("T")[0];

const EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Entertainment",
  "Bills",
  "Health",
  "Shopping",
  "Other",
];
const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Investment",
  "Gift",
  "Other",
];

const CATEGORY_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  Food: Utensils,
  Transport: Car,
  Entertainment: Music,
  Bills: FileText,
  Health: Heart,
  Shopping: ShoppingBag,
  Salary: TrendingUp,
  Freelance: TrendingUp,
  Investment: TrendingUp,
  Gift: Receipt,
  Other: Tag,
};

const CATEGORY_COLORS: Record<string, string> = {
  Food: "bg-orange-100 text-orange-700",
  Transport: "bg-blue-100 text-blue-700",
  Entertainment: "bg-purple-100 text-purple-700",
  Bills: "bg-red-100 text-red-700",
  Health: "bg-green-100 text-green-700",
  Shopping: "bg-pink-100 text-pink-700",
  Salary: "bg-emerald-100 text-emerald-700",
  Freelance: "bg-teal-100 text-teal-700",
  Investment: "bg-cyan-100 text-cyan-700",
  Gift: "bg-yellow-100 text-yellow-700",
  Other: "bg-gray-100 text-gray-700",
};

const EMPTY_FORM = {
  type: "expense",
  category: "Food",
  amount: "",
  date: TODAY,
  note: "",
};

function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function shortDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function Expenses() {
  const { data: allTransactions = [], isLoading } = useGetAllTransactions();
  const addTx = useAddTransaction();
  const updateTx = useUpdateTransaction();
  const deleteTx = useDeleteTransaction();

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth()); // 0-indexed
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<bigint | null>(null);
  const [editingId, setEditingId] = useState<bigint | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const monthStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;
  const monthTransactions = allTransactions
    .filter((t) => t.date.startsWith(monthStr))
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalIncome = monthTransactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const totalExpenses = monthTransactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpenses;

  // Category breakdown (expenses only)
  const catTotals: Record<string, number> = {};
  for (const t of monthTransactions.filter((t) => t.type === "expense")) {
    catTotals[t.category] = (catTotals[t.category] ?? 0) + t.amount;
  }
  const maxCat = Math.max(...Object.values(catTotals), 1);
  const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString(
    "en-US",
    {
      month: "long",
      year: "numeric",
    },
  );

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  function openAdd() {
    const dayStr = String(now.getDate()).padStart(2, "0");
    setForm({ ...EMPTY_FORM, date: `${monthStr}-${dayStr}` });
    setEditingId(null);
    setOpen(true);
  }

  function openEdit(tx: Transaction) {
    setForm({
      type: tx.type,
      category: tx.category,
      amount: tx.amount.toString(),
      date: tx.date,
      note: tx.note,
    });
    setEditingId(tx.id);
    setOpen(true);
  }

  async function handleSubmit() {
    const amount = Number.parseFloat(form.amount);
    if (!form.amount || Number.isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    try {
      if (editingId !== null) {
        await updateTx.mutateAsync({ id: editingId, ...form, amount });
        toast.success("Transaction updated");
      } else {
        await addTx.mutateAsync({ ...form, amount });
        toast.success("Transaction added");
      }
      setOpen(false);
    } catch {
      toast.error("Something went wrong");
    }
  }

  async function handleDelete() {
    if (deleteId === null) return;
    try {
      await deleteTx.mutateAsync(deleteId);
      toast.success("Transaction deleted");
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleteId(null);
    }
  }

  const isSaving = addTx.isPending || updateTx.isPending;
  const categories =
    form.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Wallet className="w-6 h-6 text-primary" />
            Expense Tracker
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Budget planner &amp; spending overview
          </p>
        </div>
        <Button
          data-ocid="expenses.open_modal_button"
          onClick={openAdd}
          className="gap-2"
        >
          <Plus className="w-4 h-4" /> Add Transaction
        </Button>
      </div>

      {/* Month navigator */}
      <div className="flex items-center gap-3 mb-5">
        <Button
          data-ocid="expenses.month_prev.button"
          variant="outline"
          size="icon"
          onClick={prevMonth}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm font-semibold text-foreground w-36 text-center">
          {monthLabel}
        </span>
        <Button
          data-ocid="expenses.month_next.button"
          variant="outline"
          size="icon"
          onClick={nextMonth}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl shadow-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-xs text-muted-foreground font-medium">
              Income
            </span>
          </div>
          <p className="text-xl font-bold text-success">{fmt(totalIncome)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl shadow-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-destructive" />
            <span className="text-xs text-muted-foreground font-medium">
              Expenses
            </span>
          </div>
          <p className="text-xl font-bold text-destructive">
            {fmt(totalExpenses)}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl shadow-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Scale className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground font-medium">
              Balance
            </span>
          </div>
          <p
            className={`text-xl font-bold ${
              balance >= 0 ? "text-success" : "text-destructive"
            }`}
          >
            {fmt(balance)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction list */}
        <div className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-foreground mb-3">
            Transactions
          </h2>
          {isLoading ? (
            <div
              data-ocid="expenses.loading_state"
              className="flex justify-center py-12"
            >
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : monthTransactions.length === 0 ? (
            <div
              data-ocid="expenses.empty_state"
              className="bg-card border border-border rounded-xl shadow-card text-center py-12"
            >
              <Receipt className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-foreground font-medium text-sm">
                No transactions this month
              </p>
              <p className="text-muted-foreground text-xs mt-1 mb-4">
                Track your income and expenses
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={openAdd}
                className="gap-2"
              >
                <Plus className="w-3.5 h-3.5" /> Add transaction
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {monthTransactions.map((tx, idx) => {
                const CatIcon = CATEGORY_ICONS[tx.category] ?? Tag;
                const catColor =
                  CATEGORY_COLORS[tx.category] ?? "bg-gray-100 text-gray-700";
                return (
                  <div
                    key={tx.id.toString()}
                    data-ocid={`expenses.item.${idx + 1}`}
                    className="bg-card border border-border rounded-lg shadow-card px-4 py-3 flex items-center gap-3"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${catColor}`}
                    >
                      <CatIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground truncate">
                          {tx.note || tx.category}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0"
                        >
                          {tx.category}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {shortDate(tx.date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`text-sm font-semibold ${
                          tx.type === "income"
                            ? "text-success"
                            : "text-destructive"
                        }`}
                      >
                        {tx.type === "income" ? "+" : "-"}
                        {fmt(tx.amount)}
                      </span>
                      <Button
                        data-ocid={`expenses.edit_button.${idx + 1}`}
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={() => openEdit(tx)}
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button
                        data-ocid={`expenses.delete_button.${idx + 1}`}
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteId(tx.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Category breakdown */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">
            Spending by category
          </h2>
          <div className="bg-card border border-border rounded-xl shadow-card p-4">
            {sortedCats.length === 0 ? (
              <p className="text-muted-foreground text-xs text-center py-6">
                No expense data for this month
              </p>
            ) : (
              <div className="space-y-3">
                {sortedCats.map(([cat, amount]) => (
                  <div key={cat}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-foreground">{cat}</span>
                      <span className="text-muted-foreground">
                        {fmt(amount)}
                      </span>
                    </div>
                    <Progress
                      value={(amount / maxCat) * 100}
                      className="h-1.5"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-ocid="expenses.dialog" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId !== null ? "Edit Transaction" : "Add Transaction"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Type toggle */}
            <div className="space-y-1.5">
              <Label>Type</Label>
              <div className="flex gap-2">
                {["income", "expense"].map((t) => (
                  <button
                    type="button"
                    key={t}
                    data-ocid="expenses.type.toggle"
                    onClick={() => {
                      setForm((p) => ({
                        ...p,
                        type: t,
                        category: t === "income" ? "Salary" : "Food",
                      }));
                    }}
                    className={[
                      "flex-1 py-2 rounded-lg text-sm font-medium transition-all border",
                      form.type === t
                        ? t === "income"
                          ? "bg-success/10 text-success border-success/30"
                          : "bg-destructive/10 text-destructive border-destructive/30"
                        : "bg-muted text-muted-foreground border-border hover:bg-muted/80",
                    ].join(" ")}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
                >
                  <SelectTrigger data-ocid="expenses.category.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tx-amount">Amount ($)</Label>
                <Input
                  id="tx-amount"
                  data-ocid="expenses.amount.input"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, amount: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tx-date">Date</Label>
              <Input
                id="tx-date"
                data-ocid="expenses.date.input"
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((p) => ({ ...p, date: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tx-note">Note</Label>
              <Input
                id="tx-note"
                data-ocid="expenses.note.input"
                placeholder="Optional note"
                value={form.note}
                onChange={(e) =>
                  setForm((p) => ({ ...p, note: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              data-ocid="expenses.cancel_button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="expenses.submit_button"
              onClick={handleSubmit}
              disabled={isSaving}
            >
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingId !== null ? "Save" : "Add"}
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
            <AlertDialogTitle>Delete transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This transaction will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="expenses.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="expenses.confirm_button"
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteTx.isPending ? (
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
