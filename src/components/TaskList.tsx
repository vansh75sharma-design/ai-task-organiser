import React, { useMemo, useState } from 'react';
import {
  Check,
  Trash2,
  Search,
  ArrowUpDown,
  Pencil,
  X,
  Save,
  ClipboardList,
} from 'lucide-react';
import { Priority, Task, TaskFilter, TaskSort } from '../types/task';
import { getDeadlineInfo } from '../utils/storage';

interface TaskListProps {
  tasks: Task[];
  filter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (
    id: string,
    updates: Partial<Pick<Task, 'title' | 'description' | 'priority' | 'deadline'>>
  ) => void;
  onClearCompleted: () => void;
  onFocusNewTask: () => void;
}

const PRIORITY_WEIGHT: Record<Priority, number> = {
  High: 3,
  Medium: 2,
  Low: 1,
};

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  filter,
  onFilterChange,
  onToggleComplete,
  onDeleteTask,
  onUpdateTask,
  onClearCompleted,
  onFocusNewTask,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<TaskSort>('newest');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState<Priority>('Medium');
  const [editDeadline, setEditDeadline] = useState('');

  const counts = useMemo(() => {
    const completed = tasks.filter((t) => t.completed).length;
    return {
      all: tasks.length,
      pending: tasks.length - completed,
      completed,
    };
  }, [tasks]);

  const visibleTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return tasks
      .filter((task) => {
        if (filter === 'pending' && task.completed) return false;
        if (filter === 'completed' && !task.completed) return false;
        if (query) {
          const inTitle = task.title.toLowerCase().includes(query);
          const inDesc = task.description.toLowerCase().includes(query);
          return inTitle || inDesc;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'priority') {
          const diff = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
          if (diff !== 0) return diff;
          return b.createdAt.localeCompare(a.createdAt);
        }
        if (sortBy === 'deadline') {
          if (!a.deadline && !b.deadline) return b.createdAt.localeCompare(a.createdAt);
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          const dateDiff = a.deadline.localeCompare(b.deadline);
          if (dateDiff !== 0) return dateDiff;
          return PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
        }
        return b.createdAt.localeCompare(a.createdAt);
      });
  }, [tasks, filter, searchQuery, sortBy]);

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditPriority(task.priority);
    setEditDeadline(task.deadline);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = (id: string) => {
    const trimmed = editTitle.trim();
    if (!trimmed) return;
    onUpdateTask(id, {
      title: trimmed,
      description: editDescription.trim(),
      priority: editPriority,
      deadline: editDeadline,
    });
    setEditingId(null);
  };

  const filterTabs: { id: TaskFilter; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'pending', label: 'Pending', count: counts.pending },
    { id: 'completed', label: 'Completed', count: counts.completed },
  ];

  return (
    <section
      aria-labelledby="task-list-heading"
      className="rounded-xl border border-[#1F273D] bg-[#121726]"
    >
      {/* Toolbar Header */}
      <div className="flex flex-col gap-4 border-b border-[#1F273D] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="task-list-heading" className="text-base font-semibold text-slate-100">
            Tasks
          </h2>
          <p className="mt-0.5 text-xs text-slate-400 tabular-nums">
            Showing {visibleTasks.length} of {tasks.length} total tasks
          </p>
        </div>

        {/* Segmented Filter Control */}
        <div
          role="tablist"
          aria-label="Filter tasks by status"
          className="inline-flex items-center gap-1 rounded-lg border border-[#27314D] bg-[#0B0E17] p-1 self-start sm:self-auto"
        >
          {filterTabs.map((tab) => {
            const active = filter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onFilterChange(tab.id)}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                  active
                    ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`font-mono tabular-nums ${
                    active ? 'text-violet-100' : 'text-slate-500'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Sort Controls */}
      <div className="flex flex-col gap-3 border-b border-[#1F273D] px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or description..."
            aria-label="Search tasks"
            className="w-full rounded-lg border border-[#27314D] bg-[#0B0E17] py-2 pl-9 pr-3 text-sm text-slate-100 placeholder-slate-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25"
          />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 shrink-0" aria-hidden="true" />
            <label htmlFor="sort-tasks" className="sr-only">
              Sort tasks
            </label>
            <select
              id="sort-tasks"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as TaskSort)}
              className="rounded-lg border border-[#27314D] bg-[#0B0E17] px-3 py-2 text-xs font-medium text-slate-200 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/25"
            >
              <option value="newest">Sort: Newest</option>
              <option value="priority">Sort: Priority</option>
              <option value="deadline">Sort: Deadline</option>
            </select>
          </div>

          {counts.completed > 0 && (
            <button
              type="button"
              onClick={onClearCompleted}
              className="rounded-lg border border-[#27314D] bg-[#0B0E17] px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:border-rose-500/40 hover:text-rose-300 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            >
              Clear Completed
            </button>
          )}
        </div>
      </div>

      {/* Task Rows */}
      {visibleTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-[#27314D] bg-[#0B0E17] text-slate-400">
            <ClipboardList className="h-5 w-5" aria-hidden="true" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">
            {tasks.length === 0
              ? 'No tasks yet'
              : searchQuery.trim()
              ? 'No matching tasks found'
              : `No ${filter} tasks`}
          </h3>
          <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-400">
            {tasks.length === 0
              ? 'Create your first task using the form to track deadlines, priorities, and completion progress.'
              : searchQuery.trim()
              ? 'Try clearing your search term or switching to the All tab.'
              : filter === 'completed'
              ? 'Mark a pending task as completed to see it tracked here.'
              : 'All tasks are completed! Add another task whenever you are ready.'}
          </p>
          {tasks.length === 0 && (
            <button
              type="button"
              onClick={onFocusNewTask}
              className="mt-4 rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-2 text-xs font-semibold text-white hover:opacity-95 transition-opacity"
            >
              Add Your First Task
            </button>
          )}
        </div>
      ) : (
        <ul className="divide-y divide-[#1F273D]">
          {visibleTasks.map((task) => {
            const deadlineInfo = getDeadlineInfo(task.deadline, task.completed);
            const isEditing = editingId === task.id;

            const priorityColorClass =
              task.priority === 'High'
                ? 'text-rose-400'
                : task.priority === 'Medium'
                ? 'text-violet-300'
                : 'text-blue-300';

            const deadlineColorClass =
              deadlineInfo.state === 'overdue'
                ? 'text-rose-400 font-medium'
                : deadlineInfo.state === 'today'
                ? 'text-amber-300 font-medium'
                : deadlineInfo.state === 'soon'
                ? 'text-blue-300'
                : 'text-slate-400';

            return (
              <li
                key={task.id}
                className="px-5 py-4 transition-colors duration-150 hover:bg-[#161D30]/70"
              >
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      aria-label="Edit task title"
                      className="w-full rounded-lg border border-[#2D3858] bg-[#0B0E17] px-3 py-2 text-sm text-slate-100 focus:border-violet-500 focus:outline-none"
                    />
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={2}
                      aria-label="Edit task description"
                      placeholder="Description..."
                      className="w-full resize-none rounded-lg border border-[#2D3858] bg-[#0B0E17] px-3 py-2 text-sm text-slate-100 focus:border-violet-500 focus:outline-none"
                    />
                    <div className="flex flex-wrap items-center gap-3">
                      <select
                        value={editPriority}
                        onChange={(e) => setEditPriority(e.target.value as Priority)}
                        aria-label="Edit priority"
                        className="rounded-lg border border-[#2D3858] bg-[#0B0E17] px-3 py-1.5 text-xs text-slate-200 focus:border-violet-500 focus:outline-none"
                      >
                        <option value="High">High Priority</option>
                        <option value="Medium">Medium Priority</option>
                        <option value="Low">Low Priority</option>
                      </select>

                      <input
                        type="date"
                        value={editDeadline}
                        onChange={(e) => setEditDeadline(e.target.value)}
                        aria-label="Edit deadline"
                        className="rounded-lg border border-[#2D3858] bg-[#0B0E17] px-3 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none [color-scheme:dark]"
                      />

                      <div className="ml-auto flex items-center gap-2">
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="inline-flex items-center gap-1 rounded-lg border border-[#27314D] px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white"
                        >
                          <X className="h-3.5 w-3.5" />
                          <span>Cancel</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => saveEdit(task.id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-500"
                        >
                          <Save className="h-3.5 w-3.5" />
                          <span>Save</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3.5">
                    {/* Completion Toggle Button */}
                    <button
                      type="button"
                      onClick={() => onToggleComplete(task.id)}
                      aria-label={
                        task.completed
                          ? `Mark "${task.title}" as pending`
                          : `Mark "${task.title}" as completed`
                      }
                      aria-pressed={task.completed}
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                        task.completed
                          ? 'border-violet-500 bg-gradient-to-br from-violet-600 to-blue-600 text-white'
                          : 'border-[#334066] bg-[#0B0E17] text-transparent hover:border-violet-400'
                      }`}
                    >
                      <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                    </button>

                    {/* Task Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3
                          className={`text-sm font-medium leading-snug ${
                            task.completed
                              ? 'text-slate-500 line-through'
                              : 'text-slate-100'
                          }`}
                        >
                          {task.title}
                        </h3>
                      </div>

                      {task.description && (
                        <p
                          className={`mt-1 text-xs leading-relaxed ${
                            task.completed ? 'text-slate-500' : 'text-slate-400'
                          }`}
                        >
                          {task.description}
                        </p>
                      )}

                      {/* Unboxed Metadata Row */}
                      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                        <span className={`font-medium ${priorityColorClass}`}>
                          {task.priority} priority
                        </span>
                        <span aria-hidden="true" className="text-slate-600">
                          ·
                        </span>
                        <span className={`tabular-nums ${deadlineColorClass}`}>
                          {deadlineInfo.label}
                        </span>
                        <span aria-hidden="true" className="text-slate-600">
                          ·
                        </span>
                        <span
                          className={
                            task.completed ? 'text-violet-400' : 'text-slate-400'
                          }
                        >
                          {task.completed ? 'Completed' : 'Pending'}
                        </span>
                      </div>
                    </div>

                    {/* Row Actions */}
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => startEdit(task)}
                        aria-label={`Edit "${task.title}"`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-[#1E263D] hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteTask(task.id)}
                        aria-label={`Delete "${task.title}"`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-500/15 hover:text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};
