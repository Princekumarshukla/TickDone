import React from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  BellRing, 
  Flame,
  Volume2
} from 'lucide-react';
import { Task } from '../types';
import { isTaskOverdue, isTaskDueToday } from '../utils/dateUtils';
import { soundManager } from '../utils/audio';

interface StatsBannerProps {
  tasks: Task[];
  onFilterOverdue?: () => void;
  onOpenReminderCenter: () => void;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({
  tasks,
  onFilterOverdue,
  onOpenReminderCenter,
}) => {
  const todayTasks = tasks.filter((t) => isTaskDueToday(t.dueDate));
  const completedToday = todayTasks.filter((t) => t.completed).length;
  const totalToday = todayTasks.length;
  const completionPercent = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  const overdueTasks = tasks.filter(
    (t) => !t.completed && isTaskOverdue(t.dueDate, t.dueTime)
  );

  const activeReminders = tasks.filter(
    (t) => !t.completed && t.reminderEnabled
  );

  const handleTestChime = () => {
    soundManager.playReminderChime('chime', 0.8);
  };

  return (
    <div id="stats-banner-container" className="mb-6 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-800/80 border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
      
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-60 h-60 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Left: Today's Goal Progress */}
        <div className="flex-1 max-w-xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Daily Focus & Progress
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-400">
              {completedToday} of {totalToday} today tasks done
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {completionPercent === 100 && totalToday > 0
              ? '🎉 All caught up for today! Outstanding work.'
              : completionPercent > 50
              ? '⚡ You are over halfway through your day!'
              : '🎯 Let’s conquer today’s schedule.'}
          </h2>

          {/* Progress Bar */}
          <div className="mt-3.5 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium text-slate-300">Daily Completion</span>
              <span className="font-bold text-emerald-400 font-mono">{completionPercent}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700/50 p-0.5">
              <div
                id="daily-progress-bar-fill"
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: Quick Stat Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          
          {/* Active Scheduled Reminders */}
          <button
            id="stat-card-reminders"
            onClick={onOpenReminderCenter}
            className="flex flex-col p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/40 hover:border-emerald-500/30 transition-all text-left group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 group-hover:text-emerald-300">
                Auto Reminders
              </span>
              <BellRing className="h-4 w-4 text-emerald-400 group-hover:animate-bounce" />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white font-mono">{activeReminders.length}</span>
              <span className="text-[10px] text-emerald-400 font-medium">scheduled</span>
            </div>
          </button>

          {/* Overdue Warnings */}
          <div
            id="stat-card-overdue"
            onClick={overdueTasks.length > 0 ? onFilterOverdue : undefined}
            className={`flex flex-col p-3 rounded-xl border transition-all text-left ${
              overdueTasks.length > 0
                ? 'bg-rose-950/20 border-rose-500/30 hover:bg-rose-950/30 cursor-pointer'
                : 'bg-slate-800/60 border-slate-700/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-medium ${overdueTasks.length > 0 ? 'text-rose-300' : 'text-slate-400'}`}>
                Overdue
              </span>
              <AlertCircle className={`h-4 w-4 ${overdueTasks.length > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-500'}`} />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className={`text-2xl font-bold font-mono ${overdueTasks.length > 0 ? 'text-rose-400' : 'text-white'}`}>
                {overdueTasks.length}
              </span>
              <span className="text-[10px] text-slate-400">tasks</span>
            </div>
          </div>

          {/* Total Pending / Audio Check */}
          <div
            id="stat-card-sound-check"
            className="flex flex-col p-3 rounded-xl bg-slate-800/60 border border-slate-700/40 col-span-2 sm:col-span-1 justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Audio Engine</span>
              <button
                id="btn-test-chime-banner"
                onClick={handleTestChime}
                title="Test reminder chime sound"
                className="p-1 rounded bg-slate-700/60 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 transition-colors"
              >
                <Volume2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-slate-300">Harmonic Chime</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                Ready
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
