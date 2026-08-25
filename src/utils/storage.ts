import { Task, UserPreferences, ReminderNotificationLog } from '../types';
import { getTodayDateString } from './dateUtils';

const STORAGE_KEY_TASKS = 'tickdone_tasks_v1';
const STORAGE_KEY_PREFS = 'tickdone_prefs_v1';
const STORAGE_KEY_LOGS = 'tickdone_reminder_logs_v1';

export const DEFAULT_PREFERENCES: UserPreferences = {
  soundEnabled: true,
  soundVolume: 0.8,
  defaultSound: 'chime',
  defaultLeadTime: '15m',
  desktopNotificationsEnabled: false,
  autoSnoozeMinutes: 10,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
};

function getInitialTasks(): Task[] {
  const today = getTodayDateString();
  const d = new Date();
  
  // Calculate relative times today
  const curHour = d.getHours();
  const nextHour1 = String(Math.min(23, curHour + 1)).padStart(2, '0');
  const nextHour2 = String(Math.min(23, curHour + 3)).padStart(2, '0');
  const pastHour = String(Math.max(0, curHour - 1)).padStart(2, '0');

  const tomorrowObj = new Date();
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrow = `${tomorrowObj.getFullYear()}-${String(tomorrowObj.getMonth() + 1).padStart(2, '0')}-${String(tomorrowObj.getDate()).padStart(2, '0')}`;

  return [
    {
      id: 'task-1',
      title: 'Review Q3 Product Sprint Goals & Milestones',
      notes: 'Prepare slide deck for team alignment and check key metrics.',
      category: 'Work',
      priority: 'high',
      dueDate: today,
      dueTime: `${nextHour1}:30`,
      completed: false,
      createdAt: new Date().toISOString(),
      reminderEnabled: true,
      reminderLeadTime: '15m',
      reminderSound: 'chime',
      recurrence: 'none',
      estimatedMinutes: 45,
      subtasks: [
        { id: 'sub-1', title: 'Audit completed sprint backlog items', completed: true },
        { id: 'sub-2', title: 'Draft OKR progress overview', completed: false },
        { id: 'sub-3', title: 'Send invite link to stakeholders', completed: false },
      ],
    },
    {
      id: 'task-2',
      title: 'Hydration & 10-Minute Desk Stretch Routine',
      notes: 'Drink 500ml water and complete ergonomic shoulder/back stretches.',
      category: 'Health',
      priority: 'medium',
      dueDate: today,
      dueTime: `${curHour < 23 ? String(curHour).padStart(2, '0') : '23'}:55`,
      completed: false,
      createdAt: new Date().toISOString(),
      reminderEnabled: true,
      reminderLeadTime: '5m',
      reminderSound: 'gentle',
      recurrence: 'daily',
      estimatedMinutes: 10,
      subtasks: [],
    },
    {
      id: 'task-3',
      title: 'Submit Monthly Financial Expense Reports',
      notes: 'Upload receipts for software subscriptions and client lunch.',
      category: 'Finance',
      priority: 'urgent',
      dueDate: today,
      dueTime: `${nextHour2}:00`,
      completed: false,
      createdAt: new Date().toISOString(),
      reminderEnabled: true,
      reminderLeadTime: '30m',
      reminderSound: 'urgent',
      recurrence: 'monthly',
      estimatedMinutes: 30,
      subtasks: [
        { id: 'sub-f1', title: 'Collect Stripe & AWS PDF invoices', completed: true },
        { id: 'sub-f2', title: 'Fill reimbursement form in portal', completed: false },
      ],
    },
    {
      id: 'task-4',
      title: 'Morning Team Standup Sync',
      notes: 'Reviewed blockers and deployed v2.1 hotfix to staging.',
      category: 'Work',
      priority: 'medium',
      dueDate: today,
      dueTime: `${pastHour}:00`,
      completed: true,
      completedAt: new Date(Date.now() - 3600000).toISOString(),
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      reminderEnabled: true,
      reminderLeadTime: '15m',
      reminderSound: 'bell',
      recurrence: 'weekdays',
      estimatedMinutes: 15,
      subtasks: [],
    },
    {
      id: 'task-5',
      title: 'Weekly Grocery Restock (Organic Produce & Dairy)',
      notes: 'Get oat milk, avocados, berries, sourdough bread, and green tea.',
      category: 'Shopping',
      priority: 'low',
      dueDate: tomorrow,
      dueTime: '17:00',
      completed: false,
      createdAt: new Date().toISOString(),
      reminderEnabled: true,
      reminderLeadTime: '1h',
      reminderSound: 'marimba',
      recurrence: 'weekly',
      estimatedMinutes: 45,
      subtasks: [
        { id: 'sub-g1', title: 'Check fridge inventory', completed: true },
        { id: 'sub-g2', title: 'Carry reusable tote bags', completed: false },
      ],
    },
  ];
}

export function loadTasksFromStorage(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TASKS);
    if (!raw) {
      const initial = getInitialTasks();
      saveTasksToStorage(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load tasks from localStorage', e);
    return getInitialTasks();
  }
}

export function saveTasksToStorage(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks to localStorage', e);
  }
}

export function loadPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFS);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(prefs: UserPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify(prefs));
  } catch (e) {
    console.error('Failed to save preferences', e);
  }
}

export function loadReminderLogs(): ReminderNotificationLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOGS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveReminderLogs(logs: ReminderNotificationLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs.slice(0, 50)));
  } catch {
    // ignore
  }
}
