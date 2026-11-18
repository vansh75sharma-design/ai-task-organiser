export type Priority = 'High' | 'Medium' | 'Low';

export type TaskFilter = 'all' | 'pending' | 'completed';

export type TaskSort = 'newest' | 'deadline' | 'priority';

export type ActiveView = 'dashboard' | 'ai-demo' | 'guide';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  deadline: string; // YYYY-MM-DD or '' if unset
  completed: boolean;
  createdAt: string; // ISO timestamp
  completedAt?: string; // ISO timestamp
}

export interface TaskInput {
  title: string;
  description: string;
  priority: Priority;
  deadline: string;
}

export interface DemoSuggestion {
  id: string;
  kind: 'focus' | 'deadline' | 'cleanup' | 'template';
  heading: string;
  rationale: string;
  actionLabel: string;
  targetTaskId?: string;
  newDeadline?: string;
  templateTask?: TaskInput;
}
