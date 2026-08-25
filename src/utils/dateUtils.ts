import { ReminderLeadTime } from '../types';

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentTimeString(): string {
  const d = new Date();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function getLeadTimeMinutes(leadTime: ReminderLeadTime): number {
  switch (leadTime) {
    case 'at_time': return 0;
    case '5m': return 5;
    case '15m': return 15;
    case '30m': return 30;
    case '1h': return 60;
    case '2h': return 120;
    case '1d': return 1440;
    default: return 0;
  }
}

export function getLeadTimeLabel(leadTime: ReminderLeadTime): string {
  switch (leadTime) {
    case 'at_time': return 'At time of task';
    case '5m': return '5 minutes before';
    case '15m': return '15 minutes before';
    case '30m': return '30 minutes before';
    case '1h': return '1 hour before';
    case '2h': return '2 hours before';
    case '1d': return '1 day before';
    default: return 'At time';
  }
}

export function getTaskTargetTime(dueDate: string, dueTime?: string): Date {
  if (dueTime) {
    const [h, m] = dueTime.split(':').map(Number);
    const [year, month, day] = dueDate.split('-').map(Number);
    return new Date(year, month - 1, day, h, m, 0, 0);
  } else {
    // Default due time is 18:00 (6 PM) if no time specified
    const [year, month, day] = dueDate.split('-').map(Number);
    return new Date(year, month - 1, day, 18, 0, 0, 0);
  }
}

export function calculateReminderTriggerTime(
  dueDate: string,
  dueTime: string | undefined,
  leadTime: ReminderLeadTime
): Date {
  const target = getTaskTargetTime(dueDate, dueTime);
  const minutesBefore = getLeadTimeMinutes(leadTime);
  return new Date(target.getTime() - minutesBefore * 60 * 1000);
}

export function isTaskOverdue(dueDate: string, dueTime?: string): boolean {
  const target = getTaskTargetTime(dueDate, dueTime);
  return target.getTime() < Date.now();
}

export function isTaskDueToday(dueDate: string): boolean {
  return dueDate === getTodayDateString();
}

export function formatFriendlyDate(dateStr: string): string {
  const today = getTodayDateString();
  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  if (dateStr === today) return 'Today';
  if (dateStr === tomorrowStr) return 'Tomorrow';
  if (dateStr === yesterdayStr) return 'Yesterday';

  return dateObj.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  });
}

export function formatTimeDisplay(timeStr?: string): string {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${String(m).padStart(2, '0')} ${period}`;
}

export function getRelativeTimeRemaining(dueDate: string, dueTime?: string): {
  isPast: boolean;
  text: string;
} {
  const target = getTaskTargetTime(dueDate, dueTime).getTime();
  const now = Date.now();
  const diffMs = target - now;
  const isPast = diffMs < 0;
  const absDiff = Math.abs(diffMs);

  const diffMinutes = Math.floor(absDiff / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) {
    return { isPast, text: isPast ? 'Just now' : 'Right now' };
  }
  if (diffMinutes < 60) {
    return {
      isPast,
      text: isPast ? `${diffMinutes}m overdue` : `in ${diffMinutes}m`,
    };
  }
  if (diffHours < 24) {
    const remainMin = diffMinutes % 60;
    return {
      isPast,
      text: isPast
        ? `${diffHours}h ${remainMin > 0 ? `${remainMin}m ` : ''}overdue`
        : `in ${diffHours}h ${remainMin > 0 ? `${remainMin}m` : ''}`,
    };
  }
  return {
    isPast,
    text: isPast ? `${diffDays}d overdue` : `in ${diffDays}d`,
  };
}
