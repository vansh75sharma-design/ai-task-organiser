# AI Task Organiser by Vansh Sharma

A lightweight, responsive dark-themed task organiser dashboard built with **React**, **TypeScript**, and **Tailwind CSS** featuring purple and blue accents, browser `localStorage` persistence, live task statistics, and a clearly labelled **Demo AI Suggestions** panel.

No paid APIs, subscriptions, or external databases are required.

## Features

- **Add Tasks**: Create tasks with a title, optional description, priority (`High`, `Medium`, `Low`), and deadline date.
- **Manage Tasks**: Mark tasks as completed or pending, edit task details inline, search, sort by newest/priority/deadline, and delete tasks (with undo support).
- **Filter Views**: Filter tasks by **All**, **Pending**, and **Completed** with live counts.
- **Task Statistics**: View Total Tasks, Pending (with overdue/high-priority breakdown), Completed, and Completion Rate.
- **Browser `localStorage` Persistence**: Tasks automatically save in your browser and persist across refreshes.
- **JSON Backup**: Export your tasks as `.json` or import a saved backup anytime.
- **Demo AI Suggestions**: Clearly labelled simulated offline AI panel that analyses your current deadlines and priorities locally.

## Running Locally

1. Install **Node.js** (v18 or newer).
2. Install project dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open the local URL shown in your terminal (default: `http://localhost:3000`).

## Building & Exporting

To generate a production static bundle in the `dist/` folder:

```bash
npm run build
```

You can preview the production build locally with:

```bash
npm run preview
```

Deploy the `dist/` directory to any static hosting service such as **Vercel**, **Netlify**, **Cloudflare Pages**, or **GitHub Pages**.
