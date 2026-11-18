import React from 'react';
import { Task } from '../types/task';
import { getDeadlineInfo } from '../utils/storage';

interface StatsStripProps {
  tasks: Task[];
}

export const StatsStrip: React.FC<StatsStripProps> = ({ tasks }) => {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const highPriorityPending = tasks.filter(
    (t) => !t.completed && t.priority === 'High'
  ).length;
  const overdueCount = tasks.filter(
    (t) => !t.completed && getDeadlineInfo(t.deadline, t.completed).state === 'overdue'
  ).length;
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <section aria-label="Task statistics" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div className="rounded-xl border border-[#1F273D] bg-[#121726] p-4">
        <p className="text-xs font-medium text-slate-400">Total Tasks</p>
        <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-slate-100">
          {total}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Saved in localStorage
        </p>
      </div>

      <div className="rounded-xl border border-[#1F273D] bg-[#121726] p-4">
        <p className="text-xs font-medium text-slate-400">Pending</p>
        <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-blue-400">
          {pending}
        </p>
        <p className="mt-1 text-xs text-slate-400 tabular-nums">
          {overdueCount > 0 ? (
            <span className="text-rose-400">{overdueCount} overdue</span>
          ) : (
            <span>{highPriorityPending} high priority</span>
          )}
        </p>
      </div>

      <div className="rounded-xl border border-[#1F273D] bg-[#121726] p-4">
        <p className="text-xs font-medium text-slate-400">Completed</p>
        <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-violet-400">
          {completed}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          {pending === 0 && total > 0 ? 'All tasks cleared' : 'Marked finished'}
        </p>
      </div>

      <div className="rounded-xl border border-[#1F273D] bg-[#121726] p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-slate-400">Completion Rate</p>
          <span className="font-mono text-xs tabular-nums text-slate-300">
            {completed}/{total}
          </span>
        </div>
        <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-slate-100">
          {completionRate}%
        </p>
        <div
          className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[#1C2338]"
          role="progressbar"
          aria-valuenow={completionRate}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Task completion rate"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-300"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>
    </section>
  );
};
