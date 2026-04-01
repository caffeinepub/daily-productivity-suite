import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Expenses from "./pages/Expenses";
import Habits from "./pages/Habits";
import Journal from "./pages/Journal";
import Tasks from "./pages/Tasks";

export type Page = "tasks" | "habits" | "journal" | "expenses";

export default function App() {
  const [page, setPage] = useState<Page>("tasks");

  const pageMap: Record<Page, React.ReactNode> = {
    tasks: <Tasks />,
    habits: <Habits />,
    journal: <Journal />,
    expenses: <Expenses />,
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar current={page} onNavigate={setPage} />
      <main className="flex-1 overflow-auto">
        <div key={page} className="animate-fade-in min-h-full">
          {pageMap[page]}
        </div>
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
}
