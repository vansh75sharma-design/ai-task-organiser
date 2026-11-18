import { DemoSuggestion, Task } from '../types/task';
import { getDeadlineInfo, getOffsetDateString } from './storage';

const STARTER_SUGGESTION_TEMPLATES = [
  {
    title: 'Break down largest pending task into 20-minute steps',
    description: 'Draft 3 concrete checkpoints so your next work session starts with zero friction.',
    priority: 'Medium' as const,
    deadline: getOffsetDateString(1),
  },
  {
    title: 'Schedule a 15-minute end-of-day task review',
    description: 'Archive completed items, update priorities, and pick your #1 focus for tomorrow.',
    priority: 'Low' as const,
    deadline: getOffsetDateString(2),
  },
  {
    title: 'Reserve a 45-minute deep work block for high-priority items',
    description: 'Mute notifications and complete one high-impact task before checking messages.',
    priority: 'High' as const,
    deadline: getOffsetDateString(1),
  },
];

export function generateDemoAiSuggestions(tasks: Task[], cycleIndex = 0): DemoSuggestion[] {
  const suggestions: DemoSuggestion[] = [];
  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  // 1. Check for overdue tasks first
  const overdueTasks = pendingTasks.filter(
    (t) => getDeadlineInfo(t.deadline, t.completed).state === 'overdue'
  );
  if (overdueTasks.length > 0) {
    const firstOverdue = overdueTasks[0];
    suggestions.push({
      id: `overdue-${firstOverdue.id}`,
      kind: 'deadline',
      heading: `Reschedule overdue task: "${firstOverdue.title}"`,
      rationale: `${overdueTasks.length} pending ${
        overdueTasks.length === 1 ? 'task is' : 'tasks are'
      } past deadline. Moving it to tomorrow keeps your schedule realistic.`,
      actionLabel: 'Move to Tomorrow',
      targetTaskId: firstOverdue.id,
      newDeadline: getOffsetDateString(1),
    });
  }

  // 2. Identify top priority focus task
  const highPriorityPending = pendingTasks
    .filter((t) => t.priority === 'High')
    .sort((a, b) => {
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return a.deadline.localeCompare(b.deadline);
    });

  if (highPriorityPending.length > 0) {
    const topTask = highPriorityPending[0];
    const deadlineMeta = getDeadlineInfo(topTask.deadline, false);
    suggestions.push({
      id: `focus-${topTask.id}`,
      kind: 'focus',
      heading: `Recommended Next Focus: "${topTask.title}"`,
      rationale: `Ranked High priority${
        topTask.deadline ? ` (${deadlineMeta.label.toLowerCase()})` : ''
      }. Completing this first delivers the highest progress impact today.`,
      actionLabel: 'Mark Completed',
      targetTaskId: topTask.id,
    });
  }

  // 3. Tasks missing deadlines
  const noDeadlinePending = pendingTasks.filter((t) => !t.deadline);
  if (noDeadlinePending.length > 0) {
    const target = noDeadlinePending[0];
    suggestions.push({
      id: `no-deadline-${target.id}`,
      kind: 'deadline',
      heading: `Assign a target date to "${target.title}"`,
      rationale: `${noDeadlinePending.length} pending ${
        noDeadlinePending.length === 1 ? 'task has' : 'tasks have'
      } no deadline. Setting a 2-day target reduces backlog drift.`,
      actionLabel: 'Set 2-Day Deadline',
      targetTaskId: target.id,
      newDeadline: getOffsetDateString(2),
    });
  }

  // 4. Quick win suggestion if medium/low tasks exist
  const quickWins = pendingTasks.filter((t) => t.priority !== 'High');
  if (quickWins.length > 0 && suggestions.length < 3) {
    const quick = quickWins[cycleIndex % quickWins.length];
    suggestions.push({
      id: `quickwin-${quick.id}`,
      kind: 'cleanup',
      heading: `Quick Momentum Win: "${quick.title}"`,
      rationale: `This ${quick.priority.toLowerCase()}-priority task can build early momentum before tackling heavier deadlines.`,
      actionLabel: 'Complete Quick Win',
      targetTaskId: quick.id,
    });
  }

  // 5. If user has completed tasks and clutter, or few tasks, offer a helpful template suggestion
  if (completedTasks.length >= 3 && pendingTasks.length === 0) {
    suggestions.push({
      id: 'all-done-template',
      kind: 'template',
      heading: 'Queue up tomorrow’s primary objective',
      rationale: `All ${completedTasks.length} tasks are complete! Plan one focused task for tomorrow to stay ahead.`,
      actionLabel: 'Add Suggested Task',
      templateTask: STARTER_SUGGESTION_TEMPLATES[cycleIndex % STARTER_SUGGESTION_TEMPLATES.length],
    });
  } else if (suggestions.length < 3) {
    const template = STARTER_SUGGESTION_TEMPLATES[cycleIndex % STARTER_SUGGESTION_TEMPLATES.length];
    const alreadyExists = tasks.some(
      (t) => t.title.toLowerCase() === template.title.toLowerCase()
    );
    if (!alreadyExists) {
      suggestions.push({
        id: `template-${cycleIndex}`,
        kind: 'template',
        heading: template.title,
        rationale:
          pendingTasks.length === 0
            ? 'Your task list is currently clear. Add this structured workflow task to get started.'
            : 'Suggested habit task to keep deadlines organised without manual overhead.',
        actionLabel: 'Add to Tasks',
        templateTask: template,
      });
    }
  }

  return suggestions.slice(0, 3);
}
