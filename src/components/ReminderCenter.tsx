import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  BellRing, 
  Clock, 
  Calendar, 
  Volume2, 
  ShieldCheck, 
  ShieldAlert, 
  Sparkles,
  Play,
  History,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { Task, ReminderNotificationLog, UserPreferences } from '../types';
import { 
  calculateReminderTriggerTime, 
  formatFriendlyDate, 
  formatTimeDisplay, 
  getLeadTimeLabel 
} from '../utils/dateUtils';
import { requestNotificationPermission, hasNotificationPermission } from '../utils/notifications';
import { soundManager } from '../utils/audio';

interface ReminderCenterProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  logs: ReminderNotificationLog[];
  onClearLogs: () => void;
  onTriggerTestAlarm: (task: Task) => void;
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => void;
}

export const ReminderCenter: React.FC<ReminderCenterProps> = ({
  isOpen,
  onClose,
  tasks,
  logs,
  onClearLogs,
  onTriggerTestAlarm,
  preferences,
  onUpdatePreferences,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'queue' | 'history' | 'settings'>('queue');
  const [permissionGranted, setPermissionGranted] = useState<boolean>(hasNotificationPermission());

  if (!isOpen) return null;

  // Filter tasks that have reminders enabled and are not completed
  const activeReminderTasks = tasks
    .filter((t) => !t.completed && t.reminderEnabled)
    .map((t) => {
      const triggerDate = calculateReminderTriggerTime(t.dueDate, t.dueTime, t.reminderLeadTime);
      return {
        task: t,
        triggerDate,
      };
    })
    .sort((a, b) => a.triggerDate.getTime() - b.triggerDate.getTime());

  const handleRequestPush = async () => {
    const granted = await requestNotificationPermission();
    setPermissionGranted(granted);
    onUpdatePreferences({ desktopNotificationsEnabled: granted });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        id="reminder-center-drawer"
        className="h-full w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <BellRing className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Automated Reminders</h2>
              <p className="text-xs text-slate-400">Scheduled alarms & alerts hub</p>
            </div>
          </div>
          <button
            id="btn-close-reminder-drawer"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-4 pt-2 gap-2 text-xs font-medium">
          <button
            id="reminder-tab-queue"
            onClick={() => setActiveSubTab('queue')}
            className={`pb-2.5 px-3 border-b-2 transition-all ${
              activeSubTab === 'queue'
                ? 'border-emerald-400 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Active Queue ({activeReminderTasks.length})
          </button>
          <button
            id="reminder-tab-history"
            onClick={() => setActiveSubTab('history')}
            className={`pb-2.5 px-3 border-b-2 transition-all ${
              activeSubTab === 'history'
                ? 'border-emerald-400 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Alert History ({logs.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Push Notification Banner */}
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              {permissionGranted ? (
                <ShieldCheck className="h-5 w-5 text-emerald-400 flex-shrink-0" />
              ) : (
                <ShieldAlert className="h-5 w-5 text-amber-400 flex-shrink-0" />
              )}
              <div>
                <p className="text-xs font-semibold text-white">
                  {permissionGranted ? 'Browser Push Enabled' : 'Push Notifications Disabled'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {permissionGranted
                    ? 'Automated alerts will pop up even when tab is blurred'
                    : 'Enable browser alerts for background reminders'}
                </p>
              </div>
            </div>

            {!permissionGranted && (
              <button
                id="btn-enable-browser-push"
                onClick={handleRequestPush}
                className="flex-shrink-0 px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors"
              >
                Enable
              </button>
            )}
          </div>

          {/* QUEUE SUB-TAB */}
          {activeSubTab === 'queue' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Upcoming Scheduled Alarms</span>
                <span className="font-mono text-emerald-400">{activeReminderTasks.length} queued</span>
              </div>

              {activeReminderTasks.length === 0 ? (
                <div className="p-8 text-center bg-slate-800/30 rounded-2xl border border-slate-800">
                  <Bell className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-300">No Reminders Scheduled</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Add or edit tasks with reminders enabled to populate this automated queue.
                  </p>
                </div>
              ) : (
                activeReminderTasks.map(({ task, triggerDate }) => {
                  const isSoon = triggerDate.getTime() - Date.now() < 3600000 && triggerDate.getTime() > Date.now();
                  const isPast = triggerDate.getTime() <= Date.now();

                  return (
                    <div
                      key={task.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isSoon
                          ? 'bg-slate-800/80 border-emerald-500/40 shadow-sm'
                          : 'bg-slate-800/40 border-slate-700/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs sm:text-sm font-semibold text-white truncate">
                            {task.title}
                          </h4>
                          
                          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                            <span className="inline-flex items-center gap-1 text-emerald-400">
                              <BellRing className="h-3 w-3" />
                              {getLeadTimeLabel(task.reminderLeadTime)}
                            </span>
                            <span>•</span>
                            <span>{formatFriendlyDate(task.dueDate)}</span>
                            {task.dueTime && <span>{formatTimeDisplay(task.dueTime)}</span>}
                          </div>

                          <div className="mt-2 text-[10px] text-slate-400 font-mono">
                            Alert Time:{' '}
                            <span className="text-slate-200">
                              {triggerDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>

                        {/* Test Alarm Trigger */}
                        <button
                          id={`btn-test-queue-${task.id}`}
                          onClick={() => onTriggerTestAlarm(task)}
                          title="Simulate instant alert trigger"
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-700/80 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 text-xs font-medium transition-all"
                        >
                          <Play className="h-3 w-3 fill-current" />
                          <span>Test</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* HISTORY SUB-TAB */}
          {activeSubTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Recent Alert Logs</span>
                {logs.length > 0 && (
                  <button
                    onClick={onClearLogs}
                    className="flex items-center gap-1 text-rose-400 hover:text-rose-300 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              {logs.length === 0 ? (
                <div className="p-8 text-center bg-slate-800/30 rounded-2xl border border-slate-800">
                  <History className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-300">No Triggered Logs Yet</p>
                  <p className="text-xs text-slate-500 mt-1">
                    When reminders fire, they are timestamped and logged here for your review.
                  </p>
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-start gap-2.5"
                  >
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 mt-0.5">
                      <Bell className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-slate-200 truncate">
                        {log.taskTitle}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Triggered at {new Date(log.triggeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} ({formatFriendlyDate(log.triggeredAt.slice(0, 10))})
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
