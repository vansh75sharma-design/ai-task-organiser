import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  BookOpen,
  Download,
  Upload,
  RotateCcw,
} from 'lucide-react';
import { ActiveView } from '../types/task';

interface SidebarProps {
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  pendingCount: number;
  onExportJson: () => void;
  onImportJson: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onResetDemoTasks: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  pendingCount,
  onExportJson,
  onImportJson,
  onResetDemoTasks,
}) => {
  const navItems: {
    id: ActiveView;
    label: string;
    icon: React.ReactNode;
    count?: number;
  }[] = [
    {
      id: 'dashboard',
      label: 'Task Workspace',
      icon: <LayoutDashboard className="h-4 w-4 shrink-0" />,
      count: pendingCount,
    },
    {
      id: 'ai-demo',
      label: 'Demo AI Suggestions',
      icon: <Sparkles className="h-4 w-4 shrink-0" />,
    },
    {
      id: 'guide',
      label: 'Run & Export Guide',
      icon: <BookOpen className="h-4 w-4 shrink-0" />,
    },
  ];

  return (
    <aside className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col lg:justify-between border-r border-[#1F273D] bg-[#0E1320] px-4 py-6">
      <div className="space-y-8">
        {/* Brand Block */}
        <div className="px-2">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 text-sm font-bold text-white shadow-sm"
              aria-hidden="true"
            >
              AT
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold tracking-tight text-slate-100">
                AI Task Organiser
              </h1>
              <p className="truncate text-xs text-slate-400">by Vansh Sharma</p>
            </div>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav aria-label="Main navigation" className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectView(item.id)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-600/20 to-blue-600/15 text-slate-50 border border-violet-500/35'
                    : 'text-slate-400 hover:bg-[#151C2F] hover:text-slate-200 border border-transparent'
                }`}
              >
                <span className="flex items-center gap-2.5 whitespace-nowrap">
                  <span className={isActive ? 'text-violet-400' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </span>
                {typeof item.count === 'number' && (
                  <span className="tabular-nums text-xs font-mono text-slate-400">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Storage & Backup Actions */}
        <div className="border-t border-[#1F273D] pt-6 space-y-2">
          <p className="px-3 text-xs font-medium text-slate-400">
            Local Storage Tools
          </p>
          <button
            type="button"
            onClick={onExportJson}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-[#151C2F] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <Download className="h-3.5 w-3.5 text-blue-400 shrink-0" />
            <span className="whitespace-nowrap">Export Tasks (.json)</span>
          </button>

          <label className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-[#151C2F] hover:text-white focus-within:ring-2 focus-within:ring-blue-500">
            <Upload className="h-3.5 w-3.5 text-violet-400 shrink-0" />
            <span className="whitespace-nowrap">Import Tasks (.json)</span>
            <input
              type="file"
              accept="application/json,.json"
              onChange={onImportJson}
              className="sr-only"
            />
          </label>

          <button
            type="button"
            onClick={onResetDemoTasks}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-400 transition-colors hover:bg-[#151C2F] hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="whitespace-nowrap">Restore Sample Tasks</span>
          </button>
        </div>
      </div>

      {/* Footer Attribution */}
      <div className="border-t border-[#1F273D] px-2 pt-4 text-xs text-slate-500 space-y-1">
        <p className="text-slate-400 font-medium">Saved in Browser</p>
        <p className="leading-relaxed">
          Data persists locally via localStorage with zero external servers.
        </p>
      </div>
    </aside>
  );
};
