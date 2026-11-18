import React, { useEffect, useRef, useState } from 'react';
import {
  Plus,
  LayoutDashboard,
  Sparkles,
  BookOpen,
  Undo2,
  X,
  Download,
} from 'lucide-react';
import { ActiveView, Task, TaskFilter, TaskInput } from './types/task';
import {
  exportTasksAsJson,
  loadTasksFromStorage,
  resetToStarterTasks,
  saveTasksToStorage,
} from './utils/storage';
import { Sidebar } from './components/Sidebar';
import { StatsStrip } from './components/StatsStrip';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';
import { DemoAiPanel } from './components/DemoAiPanel';
import { GuideView } from './components/GuideView';

function createTaskId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasksFromStorage());
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [deletedTask, setDeletedTask] = useState<Task | null>(null);
  const [notice, setNotice] = useState<string>('');
  const titleInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    saveTasksToStorage(tasks);
  }, [tasks]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (!deletedTask) return;
    const timer = window.setTimeout(() => setDeletedTask(null), 6000);
    return () => window.clearTimeout(timer);
  }, [deletedTask]);

  const handleAddTask = (input: TaskInput) => {
    const newTask: Task = {
      id: createTaskId(),
      title: input.title,
      description: input.description,
      priority: input.priority,
      deadline: input.deadline,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    setNotice(`Added "${newTask.title}"`);
  };

  const handleToggleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task;
        const nextCompleted = !task.completed;
        return {
          ...task,
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date().toISOString() : undefined,
        };
      })
    );
  };

  const handleCompleteSpecificTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: true,
              completedAt: new Date().toISOString(),
            }
          : task
      )
    );
    setNotice('Marked suggested task as completed.');
  };

  const handleUpdateDeadline = (id: string, deadline: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, deadline } : task))
    );
    setNotice('Updated task deadline.');
  };

  const handleUpdateTask = (
    id: string,
    updates: Partial<Pick<Task, 'title' | 'description' | 'priority' | 'deadline'>>
  ) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...updates } : task))
    );
    setNotice('Saved task changes.');
  };

  const handleDeleteTask = (id: string) => {
    const target = tasks.find((t) => t.id === id) || null;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (target) {
      setDeletedTask(target);
    }
  };

  const handleUndoDelete = () => {
    if (!deletedTask) return;
    setTasks((prev) => [deletedTask, ...prev]);
    setDeletedTask(null);
  };

  const handleClearCompleted = () => {
    setTasks((prev) => prev.filter((t) => !t.completed));
    setNotice('Cleared completed tasks.');
  };

  const handleResetDemoTasks = () => {
    const starter = resetToStarterTasks();
    setTasks(starter);
    setFilter('all');
    setNotice('Restored sample starter tasks.');
  };

  const handleExportJson = () => {
    exportTasksAsJson(tasks);
    setNotice('Exported tasks JSON backup.');
  };

  const handleImportJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const candidateList = Array.isArray(parsed)
          ? parsed
          : Array.isArray(parsed?.tasks)
          ? parsed.tasks
          : null;

        if (!candidateList) {
          setNotice('Invalid JSON format. Expected a tasks array.');
          return;
        }

        const sanitized: Task[] = candidateList
          .filter(
            (item: unknown): item is Task =>
              typeof item === 'object' &&
              item !== null &&
              typeof (item as Task).title === 'string'
          )
          .map((item: Task) => ({
            id: typeof item.id === 'string' && item.id ? item.id : createTaskId(),
            title: item.title.trim() || 'Untitled Task',
            description: typeof item.description === 'string' ? item.description : '',
            priority:
              item.priority === 'High' ||
              item.priority === 'Medium' ||
              item.priority === 'Low'
                ? item.priority
                : 'Medium',
            deadline: typeof item.deadline === 'string' ? item.deadline : '',
            completed: Boolean(item.completed),
            createdAt:
              typeof item.createdAt === 'string'
                ? item.createdAt
                : new Date().toISOString(),
            completedAt:
              typeof item.completedAt === 'string' ? item.completedAt : undefined,
          }));

        setTasks(sanitized);
        setActiveView('dashboard');
        setNotice(`Imported ${sanitized.length} tasks from backup.`);
      } catch {
        setNotice('Could not read JSON file.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleFocusNewTask = () => {
    if (activeView !== 'dashboard') {
      setActiveView('dashboard');
      window.setTimeout(() => {
        titleInputRef.current?.focus();
      }, 60);
    } else {
      titleInputRef.current?.focus();
    }
  };

  const pendingCount = tasks.filter((t) => !t.completed).length;

  const pageHeading =
    activeView === 'dashboard'
      ? 'Task Workspace'
      : activeView === 'ai-demo'
      ? 'Demo AI Suggestions'
      : 'Run & Export Guide';

  const pageSubtitle =
    activeView === 'dashboard'
      ? 'Organise priorities, track deadlines, and persist everything in localStorage.'
      : activeView === 'ai-demo'
      ? 'Clearly labelled simulated local suggestions with zero external API keys.'
      : 'Step-by-step instructions for running, building, and exporting this project.';

  return (
    <div className="min-h-screen bg-[#0B0E17] text-slate-100 lg:flex">
      {/* Desktop Sidebar */}
      <Sidebar
        activeView={activeView}
        onSelectView={setActiveView}
        pendingCount={pendingCount}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        onResetDemoTasks={handleResetDemoTasks}
      />

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Bar */}
        <header className="border-b border-[#1F273D] bg-[#0E1320]/90 px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 lg:hidden">
                <span className="truncate text-sm font-semibold text-slate-100">
                  AI Task Organiser
                </span>
                <span aria-hidden="true" className="text-slate-600">
                  ·
                </span>
                <span className="truncate text-xs text-slate-400">
                  by Vansh Sharma
                </span>
              </div>
              <div className="hidden lg:block">
                <h2 className="text-lg font-semibold tracking-tight text-slate-100">
                  {pageHeading}
                </h2>
                <p className="text-xs text-slate-400">{pageSubtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleExportJson}
                className="inline-flex lg:hidden items-center gap-1.5 rounded-lg border border-[#27314D] bg-[#121726] px-3 py-2 text-xs font-medium text-slate-200 whitespace-nowrap shrink-0"
                aria-label="Export tasks JSON"
              >
                <Download className="h-3.5 w-3.5 text-blue-400" />
                <span>Export</span>
              </button>
              <button
                type="button"
                onClick={handleFocusNewTask}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 px-3.5 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 whitespace-nowrap shrink-0"
              >
                <Plus className="h-3.5 w-3.5 shrink-0" />
                <span>New Task</span>
              </button>
            </div>
          </div>

          {/* Mobile / Tablet Navigation Bar */}
          <nav
            aria-label="Mobile navigation"
            className="mt-3 flex items-center gap-1 overflow-x-auto lg:hidden"
          >
            <button
              type="button"
              onClick={() => setActiveView('dashboard')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                activeView === 'dashboard'
                  ? 'bg-violet-600/20 text-slate-100 border border-violet-500/40'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>Workspace</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView('ai-demo')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                activeView === 'ai-demo'
                  ? 'bg-violet-600/20 text-slate-100 border border-violet-500/40'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Demo AI</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView('guide')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                activeView === 'guide'
                  ? 'bg-violet-600/20 text-slate-100 border border-violet-500/40'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Run & Export</span>
            </button>
          </nav>
        </header>

        {/* Main Viewport */}
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8 space-y-6">
          {/* Status / Undo Notifications */}
          {(deletedTask || notice) && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-violet-500/35 bg-[#141A2E] px-4 py-3 text-xs">
              <span className="text-slate-200">
                {deletedTask
                  ? `Deleted "${deletedTask.title}"`
                  : notice}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                {deletedTask && (
                  <button
                    type="button"
                    onClick={handleUndoDelete}
                    className="inline-flex items-center gap-1 rounded-md bg-violet-600 px-2.5 py-1 font-medium text-white hover:bg-violet-500"
                  >
                    <Undo2 className="h-3 w-3" />
                    <span>Undo</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setDeletedTask(null);
                    setNotice('');
                  }}
                  aria-label="Dismiss notification"
                  className="text-slate-400 hover:text-slate-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {activeView === 'dashboard' && (
            <>
              <StatsStrip tasks={tasks} />

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
                <div className="space-y-6 lg:col-span-4">
                  <TaskForm onAddTask={handleAddTask} titleInputRef={titleInputRef} />
                  <DemoAiPanel
                    tasks={tasks}
                    onCompleteTask={handleCompleteSpecificTask}
                    onUpdateDeadline={handleUpdateDeadline}
                    onAddSuggestedTask={handleAddTask}
                  />
                </div>

                <div className="lg:col-span-8">
                  <TaskList
                    tasks={tasks}
                    filter={filter}
                    onFilterChange={setFilter}
                    onToggleComplete={handleToggleComplete}
                    onDeleteTask={handleDeleteTask}
                    onUpdateTask={handleUpdateTask}
                    onClearCompleted={handleClearCompleted}
                    onFocusNewTask={handleFocusNewTask}
                  />
                </div>
              </div>
            </>
          )}

          {activeView === 'ai-demo' && (
            <div className="space-y-6">
              <StatsStrip tasks={tasks} />
              <DemoAiPanel
                tasks={tasks}
                onCompleteTask={handleCompleteSpecificTask}
                onUpdateDeadline={handleUpdateDeadline}
                onAddSuggestedTask={handleAddTask}
                expanded
              />
            </div>
          )}

          {activeView === 'guide' && (
            <GuideView onExportJson={handleExportJson} taskCount={tasks.length} />
          )}
        </main>

        {/* Quiet Footer */}
        <footer className="border-t border-[#1F273D] px-4 py-4 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <span>AI Task Organiser by Vansh Sharma</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveView('guide')}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                Run & Export Instructions
              </button>
              <span aria-hidden="true" className="text-slate-700">
                ·
              </span>
              <span>Local browser storage</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
