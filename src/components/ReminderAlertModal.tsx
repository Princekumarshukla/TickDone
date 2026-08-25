import React, { useEffect } from 'react';
import { 
  BellRing, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  X, 
  Tag, 
  Volume2,
  AlarmClock
} from 'lucide-react';
import { ActiveReminderAlert, Priority } from '../types';
import { formatTimeDisplay, formatFriendlyDate } from '../utils/dateUtils';
import { soundManager } from '../utils/audio';

interface ReminderAlertModalProps {
  alert: ActiveReminderAlert | null;
  onDismiss: () => void;
  onComplete: (taskId: string) => void;
  onSnooze: (taskId: string, minutes: number) => void;
}

export const ReminderAlertModal: React.FC<ReminderAlertModalProps> = ({
  alert,
  onDismiss,
  onComplete,
  onSnooze,
}) => {
  useEffect(() => {
    if (alert) {
      soundManager.playReminderChime(
        (alert.sound as 'chime' | 'gentle' | 'bell' | 'marimba' | 'urgent') || 'chime',
        0.9
      );
    }
  }, [alert]);

  if (!alert) return null;

  const priorityBadge = {
    low: 'bg-slate-800 text-slate-300 border-slate-700',
    medium: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    high: 'bg-amber-500/10 text-amber-400 border-amber-500/30 font-semibold',
    urgent: 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold',
  }[alert.taskPriority];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div
        id="reminder-alarm-modal"
        className="bg-slate-900 border-2 border-emerald-500/40 rounded-3xl w-full max-w-lg shadow-2xl shadow-emerald-500/20 overflow-hidden relative"
      >
        {/* Top Accent Stripe */}
        <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 animate-pulse" />

        <div className="p-6 sm:p-7">
          
          {/* Header with animated bell */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
                <BellRing className="h-6 w-6 animate-bounce" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Automated Task Reminder
                </span>
                <p className="text-xs text-slate-400">
                  Alert: {alert.leadTimeLabel}
                </p>
              </div>
            </div>

            <button
              id="btn-dismiss-alarm-x"
              onClick={onDismiss}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Task Info Card */}
          <div className="mt-5 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
            
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                {alert.taskCategory}
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[11px] border ${priorityBadge}`}>
                {alert.taskPriority.toUpperCase()}
              </span>
            </div>

            <h3 className="text-xl font-bold text-white leading-snug">
              {alert.taskTitle}
            </h3>

            <div className="flex items-center gap-4 text-xs text-slate-300 pt-1">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-emerald-400" />
                <span>{formatFriendlyDate(alert.dueDate)}</span>
              </div>
              {alert.dueTime && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-teal-400" />
                  <span>{formatTimeDisplay(alert.dueTime)}</span>
                </div>
              )}
            </div>

          </div>

          {/* Quick Snooze & Complete Actions */}
          <div className="mt-6 space-y-3">
            
            {/* Primary Complete Button */}
            <button
              id="btn-alarm-complete-now"
              onClick={() => onComplete(alert.taskId)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all active:scale-[0.99]"
            >
              <CheckCircle2 className="h-5 w-5 stroke-[2.5]" />
              <span>Mark Completed Now</span>
            </button>

            {/* Snooze Row */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                id="btn-snooze-5m"
                onClick={() => onSnooze(alert.taskId, 5)}
                className="py-2.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 font-medium transition-colors text-center"
              >
                💤 Snooze 5m
              </button>
              <button
                id="btn-snooze-15m"
                onClick={() => onSnooze(alert.taskId, 15)}
                className="py-2.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 font-medium transition-colors text-center"
              >
                💤 Snooze 15m
              </button>
              <button
                id="btn-snooze-1h"
                onClick={() => onSnooze(alert.taskId, 60)}
                className="py-2.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 font-medium transition-colors text-center"
              >
                💤 Snooze 1 hour
              </button>
            </div>

            {/* Dismiss Button */}
            <button
              id="btn-alarm-dismiss-bottom"
              onClick={onDismiss}
              className="w-full py-2 text-xs text-slate-400 hover:text-slate-200 text-center font-medium transition-colors"
            >
              Dismiss for now
            </button>

          </div>

        </div>
      </div>
    </div>
  );
};
