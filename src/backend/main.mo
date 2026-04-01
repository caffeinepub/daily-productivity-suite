import Time "mo:core/Time";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Float "mo:core/Float";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Map "mo:core/Map";

actor {
  // Types
  type Task = {
    id : Nat;
    title : Text;
    description : Text;
    priority : Text;
    dueDate : Text;
    category : Text;
    completed : Bool;
    createdAt : Int;
  };

  type Habit = {
    id : Nat;
    name : Text;
    emoji : Text;
  };

  type HabitLog = {
    habitId : Nat;
    date : Text;
  };

  type JournalEntry = {
    id : Nat;
    title : Text;
    body : Text;
    date : Text;
    createdAt : Int;
    updatedAt : Int;
  };

  type Transaction = {
    id : Nat;
    type_ : Text;
    category : Text;
    amount : Float;
    date : Text;
    note : Text;
    createdAt : Int;
  };

  // Stable Pools
  var taskNextId = 0;
  var habitNextId = 0;
  var journalNextId = 0;
  var transactionNextId = 0;

  // TASKS
  let tasks = List.empty<Task>();

  public shared ({ caller }) func addTask(title : Text, description : Text, priority : Text, dueDate : Text, category : Text) : async Nat {
    let task : Task = {
      id = taskNextId;
      title;
      description;
      priority;
      dueDate;
      category;
      completed = false;
      createdAt = Time.now();
    };
    tasks.add(task);
    taskNextId += 1;
    task.id;
  };

  public shared ({ caller }) func updateTask(id : Nat, title : Text, description : Text, priority : Text, dueDate : Text, category : Text) : async () {
    let tasksArray = tasks.toArray();
    let updatedTasks = tasksArray.map(
      func(task) {
        if (task.id == id) {
          {
            id;
            title;
            description;
            priority;
            dueDate;
            category;
            completed = task.completed;
            createdAt = task.createdAt;
          };
        } else {
          task;
        };
      }
    );
    let newTasks = List.fromArray<Task>(updatedTasks);
    tasks.clear();
    tasks.addAll(newTasks.values());
  };

  public shared ({ caller }) func deleteTask(id : Nat) : async () {
    let filteredTasks = tasks.toArray().filter(func(task) { task.id != id });
    let newTasks = List.fromArray<Task>(filteredTasks);
    tasks.clear();
    tasks.addAll(newTasks.values());
  };

  public query ({ caller }) func getAllTasks() : async [Task] {
    tasks.toArray();
  };

  public shared ({ caller }) func toggleTaskComplete(id : Nat) : async () {
    let tasksArray = tasks.toArray();
    let updatedTasks = tasksArray.map(
      func(task) {
        if (task.id == id) {
          {
            id;
            title = task.title;
            description = task.description;
            priority = task.priority;
            dueDate = task.dueDate;
            category = task.category;
            completed = not task.completed;
            createdAt = task.createdAt;
          };
        } else {
          task;
        };
      }
    );
    let newTasks = List.fromArray<Task>(updatedTasks);
    tasks.clear();
    tasks.addAll(newTasks.values());
  };

  // HABITS
  let habits = List.empty<Habit>();
  let habitLogs = List.empty<HabitLog>();

  public shared ({ caller }) func addHabit(name : Text, emoji : Text) : async Nat {
    let habit : Habit = {
      id = habitNextId;
      name;
      emoji;
    };
    habits.add(habit);
    habitNextId += 1;
    habit.id;
  };

  public shared ({ caller }) func updateHabit(id : Nat, name : Text, emoji : Text) : async () {
    let habitsArray = habits.toArray();
    let updatedHabits = habitsArray.map(
      func(habit) {
        if (habit.id == id) {
          {
            id;
            name;
            emoji;
          };
        } else {
          habit;
        };
      }
    );
    let newHabits = List.fromArray<Habit>(updatedHabits);
    habits.clear();
    habits.addAll(newHabits.values());
  };

  public shared ({ caller }) func deleteHabit(id : Nat) : async () {
    let filteredHabits = habits.toArray().filter(func(habit) { habit.id != id });
    let newHabits = List.fromArray<Habit>(filteredHabits);
    habits.clear();
    habits.addAll(newHabits.values());
  };

  public query ({ caller }) func getAllHabits() : async [Habit] {
    habits.toArray();
  };

  public shared ({ caller }) func logHabit(habitId : Nat, date : Text) : async () {
    let filteredLogs = habitLogs.toArray().filter(
      func(log) {
        not (log.habitId == habitId and log.date == date);
      }
    );
    let newLogs = List.fromArray<HabitLog>(filteredLogs);
    habitLogs.clear();
    habitLogs.addAll(newLogs.values());
    let log : HabitLog = {
      habitId;
      date;
    };
    habitLogs.add(log);
  };

  public query ({ caller }) func getHabitLogs(habitId : Nat) : async [HabitLog] {
    habitLogs.toArray().filter(func(log) { log.habitId == habitId });
  };

  // JOURNAL
  let journal = List.empty<JournalEntry>();

  public shared ({ caller }) func addJournalEntry(title : Text, body : Text, date : Text) : async Nat {
    let entry : JournalEntry = {
      id = journalNextId;
      title;
      body;
      date;
      createdAt = Time.now();
      updatedAt = Time.now();
    };
    journal.add(entry);
    journalNextId += 1;
    entry.id;
  };

  public shared ({ caller }) func updateJournalEntry(id : Nat, title : Text, body : Text, date : Text) : async () {
    let journalArray = journal.toArray();
    let updatedJournal = journalArray.map(
      func(entry) {
        if (entry.id == id) {
          {
            id;
            title;
            body;
            date;
            createdAt = entry.createdAt;
            updatedAt = Time.now();
          };
        } else {
          entry;
        };
      }
    );
    let newJournal = List.fromArray<JournalEntry>(updatedJournal);
    journal.clear();
    journal.addAll(newJournal.values());
  };

  public shared ({ caller }) func deleteJournalEntry(id : Nat) : async () {
    let filteredJournal = journal.toArray().filter(func(entry) { entry.id != id });
    let newJournal = List.fromArray<JournalEntry>(filteredJournal);
    journal.clear();
    journal.addAll(newJournal.values());
  };

  public query ({ caller }) func getAllJournalEntries() : async [JournalEntry] {
    journal.toArray();
  };

  // EXPENSES
  let transactions = List.empty<Transaction>();

  public shared ({ caller }) func addTransaction(type_ : Text, category : Text, amount : Float, date : Text, note : Text) : async Nat {
    let transaction : Transaction = {
      id = transactionNextId;
      type_;
      category;
      amount;
      date;
      note;
      createdAt = Time.now();
    };
    transactions.add(transaction);
    transactionNextId += 1;
    transaction.id;
  };

  public shared ({ caller }) func updateTransaction(id : Nat, type_ : Text, category : Text, amount : Float, date : Text, note : Text) : async () {
    let transactionsArray = transactions.toArray();
    let updatedTransactions = transactionsArray.map(
      func(transaction) {
        if (transaction.id == id) {
          {
            id;
            type_;
            category;
            amount;
            date;
            note;
            createdAt = transaction.createdAt;
          };
        } else {
          transaction;
        };
      }
    );
    let newTransactions = List.fromArray<Transaction>(updatedTransactions);
    transactions.clear();
    transactions.addAll(newTransactions.values());
  };

  public shared ({ caller }) func deleteTransaction(id : Nat) : async () {
    let filteredTransactions = transactions.toArray().filter(func(transaction) { transaction.id != id });
    let newTransactions = List.fromArray<Transaction>(filteredTransactions);
    transactions.clear();
    transactions.addAll(newTransactions.values());
  };

  public query ({ caller }) func getAllTransactions() : async [Transaction] {
    transactions.toArray();
  };
};
