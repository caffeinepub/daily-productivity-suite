# Daily Productivity Suite

## Current State
New project. Only scaffolded Motoko actor and empty frontend exist.

## Requested Changes (Diff)

### Add
- **Task Manager**: CRUD for tasks with priority (high/medium/low), due dates, categories, completion status. Summary stats.
- **Habit Tracker**: CRUD for habits with name and emoji. Daily check-in per habit. Streak counter. Monthly calendar grid of completion history. Overall completion percentage.
- **Daily Journal**: CRUD for journal entries with title, body, and date. Browse by date. Distraction-free writing UI.
- **Expense Tracker**: CRUD for transactions (income/expense) with category, amount, date. Totals for income, expenses, balance. Category breakdown. Monthly view.
- Side navigation bar to switch between the four sections.
- All data persisted in Motoko backend.

### Modify
- Replace scaffolded actor with full backend implementation.
- Replace empty frontend with the full app.

### Remove
- Nothing.

## Implementation Plan
1. Generate Motoko backend with four data domains: tasks, habits, journal entries, transactions.
2. Build React frontend with sidebar navigation and four section views.
3. Wire all CRUD operations to backend actor calls.
4. Add sample/seed content for first-time experience.
