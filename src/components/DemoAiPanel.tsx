import React, { useMemo, useState } from 'react';
import { Sparkles, RefreshCw, ArrowRight } from 'lucide-react';
import { DemoSuggestion, Task, TaskInput } from '../types/task';
import { generateDemoAiSuggestions } from '../utils/demoAiSuggestions';

interface DemoAiPanelProps {
  tasks: Task[];
  onCompleteTask: (id: string) => void;
  onUpdateDeadline: (id: string, deadline: string) => void;
  onAddSuggestedTask: (input: TaskInput) => void;
  expanded?: boolean;
}

export const DemoAiPanel: React.FC<DemoAiPanelProps> = ({
  tasks,
  onCompleteTask,
  onUpdateDeadline,
  onAddSuggestedTask,
  expanded = false,
}) => {
  const [cycleIndex, setCycleIndex] = useState(0);

  const suggestions = useMemo(
    () => generateDemoAiSuggestions(tasks, cycleIndex),
    [tasks, cycleIndex]
  );

  const handleApply = (suggestion: DemoSuggestion) => {
    if (suggestion.templateTask) {
      onAddSuggestedTask(suggestion.templateTask);
      return;
    }
    if (suggestion.targetTaskId && suggestion.newDeadline) {
      onUpdateDeadline(suggestion.targetTaskId, suggestion.newDeadline);
      return;
    }
    if (suggestion.targetTaskId) {
      onCompleteTask(suggestion.targetTaskId);
    }
  };

  return (
    <section
      aria-labelledby="demo-ai-heading"
      className="rounded-xl border border-[#1F273D] bg-[#121726] p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#1F273D] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-400 shrink-0" aria-hidden="true" />
            <h2 id="demo-ai-heading" className="text-base font-semibold text-slate-100">
              Demo AI Suggestions
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Simulated local suggestions · Runs offline in your browser with no paid API or key
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCycleIndex((prev) => prev + 1)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#27314D] bg-[#0B0E17] px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-violet-500/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 whitespace-nowrap shrink-0"
        >
          <RefreshCw className="h-3.5 w-3.5 text-blue-400 shrink-0" />
          <span>Refresh Demo</span>
        </button>
      </div>

      <div
        className={`mt-4 ${
          expanded ? 'grid grid-cols-1 gap-4 md:grid-cols-3' : 'divide-y divide-[#1F273D]'
        }`}
      >
        {suggestions.map((item) => (
          <div
            key={item.id}
            className={
              expanded
                ? 'flex flex-col justify-between rounded-lg border border-[#232D47] bg-[#0E1320] p-4'
                : 'py-3.5 first:pt-0 last:pb-0'
            }
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-violet-300">
                <span className="font-medium">
                  {item.kind === 'focus'
                    ? 'Priority Focus'
                    : item.kind === 'deadline'
                    ? 'Deadline Check'
                    : item.kind === 'cleanup'
                    ? 'Quick Win'
                    : 'Workflow Idea'}
                </span>
                <span aria-hidden="true" className="text-slate-600">
                  ·
                </span>
                <span className="text-slate-400">Demo Mode</span>
              </div>
              <h3 className="text-sm font-medium text-slate-100 leading-snug">
                {item.heading}
              </h3>
              <p className="text-xs leading-relaxed text-slate-400">
                {item.rationale}
              </p>
            </div>

            <div className="mt-3">
              <button
                type="button"
                onClick={() => handleApply(item)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/35 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-300 transition-colors hover:bg-blue-500/20 hover:text-blue-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 whitespace-nowrap"
              >
                <span>{item.actionLabel}</span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
