export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type Category = 'Work' | 'Personal' | 'Health' | 'Finance' | 'Shopping' | 'Study' | 'Family';

export type ReminderLeadTime = 'at_time' | '5m' | '15m' | '30m' | '1h' | '2h' | '1d';

export type RecurrenceRule = 'none' | 'daily' | 'weekdays' | 'weekly' | 'monthly';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  notes?: string;
  category: Category | string;
  priority: Priority;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  completed: boolean;
  completedAt?: string; // ISO string
  createdAt: string; // ISO string
  
  // Automated Reminder settings
  reminderEnabled: boolean;
  reminderLeadTime: ReminderLeadTime;
  reminderCustomTime?: string; // Exact ISO or ISO calculated
  reminderSound: 'chime' | 'gentle' | 'bell' | 'marimba' | 'urgent';
  reminderTriggered?: boolean;
  lastRemindedAt?: string;
  snoozedUntil?: string; // ISO string if snoozed
  
  subtasks: SubTask[];
  recurrence: RecurrenceRule;
  estimatedMinutes?: number;
}

export interface ActiveReminderAlert {
  taskId: string;
  taskTitle: string;
  taskCategory: string;
  taskPriority: Priority;
  dueDate: string;
  dueTime?: string;
  leadTimeLabel: string;
  triggeredAt: string;
  sound: string;
}

export interface ReminderNotificationLog {
  id: string;
  taskId: string;
  taskTitle: string;
  triggeredAt: string;
  type: 'due' | 'lead_time' | 'snoozed';
  dismissed: boolean;
}

export interface UserPreferences {
  soundEnabled: boolean;
  soundVolume: number; // 0 to 1
  defaultSound: 'chime' | 'gentle' | 'bell' | 'marimba' | 'urgent';
  defaultLeadTime: ReminderLeadTime;
  desktopNotificationsEnabled: boolean;
  autoSnoozeMinutes: number;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // e.g. "22:00"
  quietHoursEnd: string; // e.g. "07:00"
}

export type TabView = 'today' | 'upcoming' | 'timeline' | 'all' | 'completed' | 'reminders';
