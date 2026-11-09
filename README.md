# 💸 Realtime Expense Tracker Pro

**Track spending, budgets, and recurring bills, and see exactly when a debt will be gone.**

Most expense trackers stop at a pretty list of transactions. This one keeps going: budgets that warn you before you overspend, bills with real next due dates, a spending breakdown you can actually read, and a debt-payoff planner that answers the question people really care about: if I pay this much a month, when am I done, and what does paying a little extra actually save me?

**Demo (staged for Vercel):** https://realtime-expense-tracker-pro.vercel.app - this link goes live once the repo is connected to Vercel. It is not live yet.

## What it does (v1)

1. **Entries, income and expenses** - add a description, amount, category, and date. Delete anything with one click. Running balance, total income, and total expenses update instantly, with search and category filters.
2. **Category budgets** - set a monthly limit per category and watch a progress bar fill as the month goes on. Bars turn amber at 80 percent and red when you go over, with the exact overage spelled out.
3. **Spending by category chart** - a canvas bar chart plus clean CSS bars, biggest category first. No chart library, just plain code.
4. **Recurring bills** - add rent, internet, phone, gym, anything monthly. Each bill shows its next due date and how many days away it is, sorted so the closest bill is always on top.
5. **CSV export** - one click downloads every entry as a spreadsheet-ready CSV file.
6. **Debt-payoff planner** - the signature feature. Enter a balance, APR, and monthly payment and get the months to debt-free, the payoff month, and total interest. Add an extra monthly amount and it shows exactly how many months and how much interest that extra saves you. If a payment is too small to ever clear the balance, it tells you plainly instead of pretending.
7. **Sample data and clear all** - load a realistic month in one click to see everything working, or wipe the slate clean.

Everything is saved in your browser with localStorage. No account, no server, no tracking.

## What was improved vs the classic mini project

The classic vanilla JavaScript expense tracker that a lot of us learned from, including the well known Traversy Media version, does one job well: add and delete transactions and show a balance. This project was rebuilt from scratch with original code and takes that starting point further:

- Budgets per category with progress bars and over-budget warnings, instead of just a transaction list
- A spending-by-category chart drawn in plain canvas, with no external libraries
- Recurring bills with computed next due dates, not just one-off entries
- A full debt-payoff planner with amortization math and an extra-payment comparison
- CSV export, search, and category filters
- Categories, dates, and a mobile-friendly dark UI instead of a single undifferentiated list

Credit to the classic tutorials for the inspiration. The code, structure, and every extra feature here are new.

## Run it locally

No build step. Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploying on Vercel

This project is ready to import into Vercel as-is:

- Framework preset: **Other**
- Build command: none
- Output directory: the repo root (where `index.html` lives)

No `vercel.json` is needed - Vercel's defaults for a plain static site match this layout exactly, so there is nothing to correct.

## Honest limits

- **Browser-only storage.** Data lives in localStorage on one device and one browser. Clearing browser data clears your tracker, and there is no sync. Export CSV regularly if the data matters.
- **The planner is an estimate, not financial advice.** It assumes a fixed APR, the same payment every month, and no new charges. Real statements, fees, and variable rates will differ.
- **Monthly bills only in v1.** Weekly, yearly, and custom schedules are on the roadmap.
- **Manual entry only.** Nothing connects to a bank in v1, by design. Private by default.

## Roadmap

- **v2** - edit entries instead of delete and re-add, monthly and yearly views, bill schedules beyond monthly, and a debt snowball and avalanche comparison for people carrying more than one balance.
- **v3** - import CSV from a bank export, recurring income, savings goals alongside debt goals, and optional encrypted export and import so data can move between devices safely.
- **Venture version** - bank sync so entries arrive on their own, shared household budgets where two or more people track together without stepping on each other, and an AI spending coach that notices patterns a bar chart cannot, like the subscription you forgot or the category that creeps up every single month. The planner becomes a full personal finance cockpit: debts, goals, and cash flow in one honest picture.

## License

MIT
