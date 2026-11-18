import React, { useState } from 'react';
import { Plus, Calendar } from 'lucide-react';
import { Priority, TaskInput } from '../types/task';
import { getOffsetDateString, getTodayDateString } from '../utils/storage';

interface TaskFormProps {
  onAddTask: (task: TaskInput) => void;
  titleInputRef?: React.RefObject<HTMLInputElement | null>;
}

const PRIORITIES: Priority[] = ['High', 'Medium', 'Low'];

export const TaskForm: React.FC<TaskFormProps> = ({ onAddTask, titleInputRef }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Please enter a task title.');
      return;
    }

    onAddTask({
      title: trimmedTitle,
      description: description.trim(),
      priority,
      deadline,
    });

    setTitle('');
    setDescription('');
    setPriority('Medium');
    setDeadline('');
    setError('');
  };

  return (
    <section
      aria-labelledby="add-task-heading"
      className="rounded-xl border border-[#1F273D] bg-[#121726] p-5"
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 id="add-task-heading" className="text-base font-semibold text-slate-100">
          Add New Task
        </h2>
        <span className="text-xs text-slate-400">Auto-saved locally</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label
            htmlFor="task-title"
            className="mb-1.5 block text-xs font-medium text-slate-300"
          >
            Task Title <span className="text-violet-400">*</span>
          </label>
          <input
            ref={titleInputRef}
            id="task-title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError('');
            }}
            placeholder="e.g., Prepare sprint review slides"
            maxLength={120}
            className="w-full rounded-lg border border-[#27314D] bg-[#0B0E17] px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 transition-colors focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/25"
          />
          {error && (
            <p className="mt-1.5 text-xs text-rose-400" role="alert">
              {error}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="task-description"
            className="mb-1.5 block text-xs font-medium text-slate-300"
          >
            Description
          </label>
          <textarea
            id="task-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add context, notes, or key steps..."
            rows={3}
            maxLength={400}
            className="w-full resize-none rounded-lg border border-[#27314D] bg-[#0B0E17] px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 transition-colors focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/25"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {/* Priority Selector */}
          <div>
            <span className="mb-1.5 block text-xs font-medium text-slate-300">
              Priority
            </span>
            <div
              role="group"
              aria-label="Task priority"
              className="grid grid-cols-3 gap-1.5 rounded-lg border border-[#27314D] bg-[#0B0E17] p-1"
            >
              {PRIORITIES.map((level) => {
                const selected = priority === level;
                const activeClasses =
                  level === 'High'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : level === 'Medium'
                    ? 'bg-violet-500/20 text-violet-200 border border-violet-500/40'
                    : 'bg-blue-500/20 text-blue-200 border border-blue-500/40';

                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setPriority(level)}
                    aria-pressed={selected}
                    className={`rounded-md px-2.5 py-2 text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                      selected
                        ? activeClasses
                        : 'border border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Deadline Date Picker */}
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <label
                htmlFor="task-deadline"
                className="text-xs font-medium text-slate-300"
              >
                Deadline
              </label>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setDeadline(getTodayDateString())}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Today
                </button>
                <span aria-hidden="true" className="text-slate-600">
                  ·
                </span>
                <button
                  type="button"
                  onClick={() => setDeadline(getOffsetDateString(1))}
                  className="text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Tomorrow
                </button>
                {deadline && (
                  <>
                    <span aria-hidden="true" className="text-slate-600">
                      ·
                    </span>
                    <button
                      type="button"
                      onClick={() => setDeadline('')}
                      className="text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      Clear
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="relative">
              <Calendar
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                id="task-deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-lg border border-[#27314D] bg-[#0B0E17] py-2.5 pl-9 pr-3 text-sm text-slate-100 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25 [color-scheme:dark]"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#121726]"
        >
          <Plus className="h-4 w-4 shrink-0" />
          <span className="whitespace-nowrap">Add Task</span>
        </button>
      </form>
    </section>
  );
};
