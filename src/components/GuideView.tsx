import React, { useState } from 'react';
import { Copy, Check, Download, Terminal, FolderOutput, Layers } from 'lucide-react';

interface GuideViewProps {
  onExportJson: () => void;
  taskCount: number;
}

const CommandBlock: React.FC<{ label: string; command: string }> = ({
  label,
  command,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Ignore clipboard failures in restricted environments
    }
  };

  return (
    <div className="rounded-lg border border-[#27314D] bg-[#0B0E17] p-3.5">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-400">{label}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-violet-400" />
              <span className="text-violet-300">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto font-mono text-xs text-slate-200">
        <code>{command}</code>
      </pre>
    </div>
  );
};

export const GuideView: React.FC<GuideViewProps> = ({ onExportJson, taskCount }) => {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-[#1F273D] bg-[#121726] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#1F273D] pb-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">
              Running & Exporting the Project
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Lightweight React + TypeScript + Tailwind CSS app. No external database, API keys, or paid subscriptions required.
            </p>
          </div>
          <button
            type="button"
            onClick={onExportJson}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-2 text-xs font-semibold text-white hover:opacity-95 transition-opacity whitespace-nowrap shrink-0"
          >
            <Download className="h-4 w-4" />
            <span>Export Current Tasks ({taskCount})</span>
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Local Development */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
              <Terminal className="h-4 w-4 text-violet-400" aria-hidden="true" />
              <h3>1. Run Locally on Your Computer</h3>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Install Node.js (version 18 or newer), open your terminal inside the project folder, and run these commands:
            </p>
            <div className="space-y-2.5">
              <CommandBlock label="Install dependencies" command="npm install" />
              <CommandBlock
                label="Start local development server (port 3000)"
                command="npm run dev"
              />
              <CommandBlock label="Run TypeScript check" command="npm run lint" />
            </div>
          </div>

          {/* Building & Exporting */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
              <FolderOutput className="h-4 w-4 text-blue-400" aria-hidden="true" />
              <h3>2. Build & Export for Hosting</h3>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Generate an optimised static bundle inside the <code className="font-mono text-slate-300">dist/</code> folder that can be hosted free on Netlify, Vercel, or GitHub Pages:
            </p>
            <div className="space-y-2.5">
              <CommandBlock label="Create production build" command="npm run build" />
              <CommandBlock
                label="Preview production build locally"
                command="npm run preview"
              />
            </div>
            <div className="rounded-lg border border-[#27314D] bg-[#0B0E17] p-3.5 text-xs leading-relaxed text-slate-400">
              <p className="font-medium text-slate-200">Quick Export Checklist</p>
              <ul className="mt-1.5 list-disc space-y-1 pl-4">
                <li>Download project source or push to GitHub.</li>
                <li>Deploy directly with build command <code className="font-mono text-slate-300">npm run build</code> and output folder <code className="font-mono text-slate-300">dist</code>.</li>
                <li>Use <span className="text-slate-200">Export Tasks (.json)</span> anytime to back up your browser localStorage tasks.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Overview for Beginners */}
      <section className="rounded-xl border border-[#1F273D] bg-[#121726] p-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
          <Layers className="h-4 w-4 text-violet-400" aria-hidden="true" />
          <h3>Project File Structure</h3>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Beginner-friendly modular structure inside <code className="font-mono text-slate-300">src/</code>:
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 text-xs">
          <div className="rounded-lg border border-[#232D47] bg-[#0E1320] p-3.5">
            <p className="font-mono font-medium text-violet-300">src/types/task.ts</p>
            <p className="mt-1 text-slate-400">
              TypeScript definitions for tasks, priorities, filters, and demo suggestions.
            </p>
          </div>
          <div className="rounded-lg border border-[#232D47] bg-[#0E1320] p-3.5">
            <p className="font-mono font-medium text-blue-300">src/utils/storage.ts</p>
            <p className="mt-1 text-slate-400">
              Handles browser localStorage saving, loading, deadline labels, and JSON export.
            </p>
          </div>
          <div className="rounded-lg border border-[#232D47] bg-[#0E1320] p-3.5">
            <p className="font-mono font-medium text-violet-300">src/utils/demoAiSuggestions.ts</p>
            <p className="mt-1 text-slate-400">
              Simulated offline AI heuristics that suggest priorities and next steps locally.
            </p>
          </div>
          <div className="rounded-lg border border-[#232D47] bg-[#0E1320] p-3.5">
            <p className="font-mono font-medium text-blue-300">src/components/TaskForm.tsx</p>
            <p className="mt-1 text-slate-400">
              Form for creating tasks with title, description, priority, and deadline.
            </p>
          </div>
          <div className="rounded-lg border border-[#232D47] bg-[#0E1320] p-3.5">
            <p className="font-mono font-medium text-violet-300">src/components/TaskList.tsx</p>
            <p className="mt-1 text-slate-400">
              Task list with All/Pending/Completed filters, search, sorting, edit, and delete.
            </p>
          </div>
          <div className="rounded-lg border border-[#232D47] bg-[#0E1320] p-3.5">
            <p className="font-mono font-medium text-blue-300">src/components/StatsStrip.tsx</p>
            <p className="mt-1 text-slate-400">
              Live task statistics strip showing totals, pending, completed, and completion rate.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
