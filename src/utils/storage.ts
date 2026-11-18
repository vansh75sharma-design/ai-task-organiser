import { Task } from '../types/task';

const STORAGE_KEY = 'ai_task_organiser_vansh_tasks_v1';
const INIT_FLAG_KEY = 'ai_task_organiser_vansh_initialized_v1';

export function getOffsetDateString(daysOffset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayDateString(): string {
  return getOffsetDateString(0);
}

function createStarterTasks(): Task[] {
  const now = new Date();
  return [
    {
      id: 'starter-1',
      title: 'Finalise portfolio project README & screenshots',
      description: 'Add clear setup commands, feature overview, and responsive preview captures before publishing.',
      priority: 'High',
      deadline: getOffsetDateString(1),
      completed: false,
      createdAt: new Date(now.getTime() - 1000 * 60 * 180).toISOString(),
    },
    {
      id: 'starter-2',
      title: 'Review weekly study & sprint priorities',
      description: 'Check upcoming deadlines, group related tasks, and allocate deep-work blocks for the week.',
      priority: 'Medium',
      deadline: getOffsetDateString(3),
      completed: false,
      createdAt: new Date(now.getTime() - 1000 * 60 * 360).toISOString(),
    },
    {
      id: 'starter-3',
      title: 'Organise local project archive folders',
      description: 'Clean up unused downloads and export backup JSON of active task lists.',
      priority: 'Low',
      deadline: getOffsetDateString(6),
      completed: false,
      createdAt: new Date(now.getTime() - 1000 * 60 * 720).toISOString(),
    },
    {
      id: 'starter-4',
      title: 'Set up React + TypeScript workspace structure',
      description: 'Configured Tailwind CSS dark theme, localStorage persistence, and responsive dashboard layout.',
      priority: 'Medium',
      deadline: getOffsetDateString(0),
      completed: true,
      createdAt: new Date(now.getTime() - 1000 * 60 * 1440).toISOString(),
      completedAt: new Date(now.getTime() - 1000 * 60 * 90).toISOString(),
    },
  ];
}

export function loadTasksFromStorage(): Task[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const initialized = window.localStorage.getItem(INIT_FLAG_KEY);

    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (item): item is Task =>
            typeof item === 'object' &&
            item !== null &&
            typeof item.id === 'string' &&
            typeof item.title === 'string' &&
            typeof item.completed === 'boolean'
        );
      }
    }

    if (!initialized) {
      const starter = createStarterTasks();
      window.localStorage.setItem(INIT_FLAG_KEY, 'true');
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(starter));
      return starter;
    }

    return [];
  } catch {
    return [];
  }
}

export function saveTasksToStorage(tasks: Task[]): void {
  try {
    window.localStorage.setItem(INIT_FLAG_KEY, 'true');
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // Ignore storage quota or private-mode errors gracefully
  }
}

export function resetToStarterTasks(): Task[] {
  const starter = createStarterTasks();
  saveTasksToStorage(starter);
  return starter;
}

export type DeadlineState = 'overdue' | 'today' | 'soon' | 'upcoming' | 'none';

export function getDeadlineInfo(
  deadline: string,
  completed: boolean
): { label: string; state: DeadlineState } {
  if (!deadline) {
    return { label: 'No deadline', state: 'none' };
  }

  const todayStr = getTodayDateString();
  const [tYear, tMonth, tDay] = todayStr.split('-').map(Number);
  const [dYear, dMonth, dDay] = deadline.split('-').map(Number);

  if (!dYear || !dMonth || !dDay) {
    return { label: deadline, state: 'upcoming' };
  }

  const todayMs = Date.UTC(tYear, tMonth - 1, tDay);
  const targetMs = Date.UTC(dYear, dMonth - 1, dDay);
  const diffDays = Math.round((targetMs - todayMs) / (1000 * 60 * 60 * 24));

  const formatted = new Date(Date.UTC(dYear, dMonth - 1, dDay)).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });

  if (completed) {
    return { label: `Due ${formatted}`, state: 'none' };
  }

  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    return {
      label: `Overdue ${overdueDays}d · ${formatted}`,
      state: 'overdue',
    };
  }
  if (diffDays === 0) {
    return { label: `Due today · ${formatted}`, state: 'today' };
  }
  if (diffDays === 1) {
    return { label: `Due tomorrow · ${formatted}`, state: 'soon' };
  }
  if (diffDays <= 3) {
    return { label: `Due in ${diffDays}d · ${formatted}`, state: 'soon' };
  }
  return { label: `Due ${formatted}`, state: 'upcoming' };
}

export function exportTasksAsJson(tasks: Task[]): void {
  const payload = {
    app: 'AI Task Organiser by Vansh Sharma',
    exportedAt: new Date().toISOString(),
    taskCount: tasks.length,
    tasks,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `ai-task-organiser-backup-${getTodayDateString()}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
