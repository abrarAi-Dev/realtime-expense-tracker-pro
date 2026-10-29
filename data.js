// Realtime Expense Tracker Pro - static data and sample data
// No external data, no tracking. Everything stays in the browser.

const EXPENSE_CATEGORIES = [
  "Housing",
  "Food",
  "Transport",
  "Utilities",
  "Health",
  "Entertainment",
  "Shopping",
  "Education",
  "Other"
];

const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Business",
  "Other Income"
];

const ALL_CATEGORIES = EXPENSE_CATEGORIES.concat(INCOME_CATEGORIES);

const CATEGORY_COLORS = {
  Housing: "#4f8cff",
  Food: "#ffb454",
  Transport: "#8fe3a8",
  Utilities: "#c792ea",
  Health: "#ff9a9a",
  Entertainment: "#6ee7d8",
  Shopping: "#f78fb3",
  Education: "#a8c0ff",
  Other: "#9fb0cc",
  Salary: "#8fe3a8",
  Freelance: "#6ee7d8",
  Business: "#ffb454",
  "Other Income": "#9fb0cc"
};

function sampleData() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  function d(day) {
    return y + "-" + m + "-" + String(day).padStart(2, "0");
  }
  return {
    entries: [
      { id: "s1", description: "Monthly salary", amount: 3200, type: "income", category: "Salary", date: d(1) },
      { id: "s2", description: "Freelance project", amount: 450, type: "income", category: "Freelance", date: d(8) },
      { id: "s3", description: "Rent", amount: 950, type: "expense", category: "Housing", date: d(2) },
      { id: "s4", description: "Groceries", amount: 184.5, type: "expense", category: "Food", date: d(5) },
      { id: "s5", description: "Electric bill", amount: 86.2, type: "expense", category: "Utilities", date: d(7) },
      { id: "s6", description: "Bus pass and gas", amount: 72, type: "expense", category: "Transport", date: d(9) },
      { id: "s7", description: "Dinner out", amount: 48.75, type: "expense", category: "Food", date: d(11) },
      { id: "s8", description: "Pharmacy", amount: 32.4, type: "expense", category: "Health", date: d(12) },
      { id: "s9", description: "Movie night", amount: 28, type: "expense", category: "Entertainment", date: d(14) },
      { id: "s10", description: "New headphones", amount: 59.99, type: "expense", category: "Shopping", date: d(16) },
      { id: "s11", description: "Online course", amount: 39, type: "expense", category: "Education", date: d(18) },
      { id: "s12", description: "Internet bill", amount: 55, type: "expense", category: "Utilities", date: d(20) }
    ],
    budgets: {
      Housing: 1000,
      Food: 400,
      Transport: 150,
      Utilities: 200,
      Health: 150,
      Entertainment: 100,
      Shopping: 150,
      Education: 100,
      Other: 100
    },
    bills: [
      { id: "b1", name: "Rent", amount: 950, dueDay: 1, category: "Housing" },
      { id: "b2", name: "Internet", amount: 55, dueDay: 20, category: "Utilities" },
      { id: "b3", name: "Phone plan", amount: 45, dueDay: 24, category: "Utilities" },
      { id: "b4", name: "Gym", amount: 30, dueDay: 28, category: "Health" }
    ]
  };
}
