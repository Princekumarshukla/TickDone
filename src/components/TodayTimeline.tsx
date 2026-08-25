import React from 'react';
import { 
  Clock, 
  CheckCircle2, 
  BellRing, 
  AlertCircle, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { Task } from '../types';
import { 
  getTodayDateString, 
  formatTimeDisplay, 
  calculateReminderTriggerTime, 
  isTaskOverdue 
} from '../utils/dateUtils';

interface TodayTimelineProps {
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
  onEditTask: (task: Task) => void;
}

export const TodayTimeline: React.FC<TodayTimelineProps> = ({
  tasks,
  onToggleComplete,
  onEditTask,
}) => {
  const todayStr = getTodayDateString();
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr);

  // Time periods: Morning (6:00 - 11:59), Afternoon (12:00 - 16:59), Evening (17:00 - 21:59), Night (22:00 - 5:59)
  const periods = [
    { name: 'Morning', hours: '6:00 AM – 11:59 AM', filter: (t: Task) => {
      const h = t.dueTime ? parseInt(t.dueTime.split(':')[0], 10) : 9;
      return h >= 6 && h < 12;
    }},
    { name: 'Afternoon', hours: '12:00 PM – 4:59 PM', filter: (t: Task) => {
      const h = t.dueTime ? parseInt(t.dueTime.split(':')[0], 10) : 14;
      return h >= 12 && h < 17;
    }},
    { name: 'Evening', hours: '5:00 PM – 9:59 PM', filter: (t: Task) => {
      const h = t.dueTime ? parseInt(t.dueTime.split(':')[0], 10) : 18;
      return h >= 17 && h < 22;
    }},
    { name: 'Night / Later', hours: '10:00 PM – 5:59 AM', filter: (t: Task) => {
      const h = t.dueTime ? parseInt(t.dueTime.split(':')[0], 10) : 23;
      return h >= 22 || h < 6;
    }},
  ];

  return (
    <div id="today-timeline-container" className="space-y-6">
      
      {/* Header Info */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-emerald-400" />
            Today's Timeline & Schedule
          </h2>
          <p className="text-xs text-slate-400">
            Chronological breakdown with automated alert checkpoints
          </p>
        </div>
        <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
          {todayTasks.length} tasks scheduled for today
        </div>
      </div>

      {todayTasks.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800">
          <Calendar className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <p className="text-base font-semibold text-slate-300">No Tasks Scheduled for Today</p>
          <p className="text-xs text-slate-500 mt-1">
            Add tasks with today's date to see your hourly timeline breakdown here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {periods.map((period) => {
            const periodTasks = todayTasks.filter(period.filter);
            if (periodTasks.length === 0) return null;

            return (
              <div key={period.name} className="space-y-3">
                
                {/* Period Section Title */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    {period.name}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">({period.hours})</span>
                  <div className="flex-1 h-px bg-slate-800" />
                </div>

                {/* Timeline Cards */}
                <div className="space-y-2.5 pl-3 border-l-2 border-slate-800">
                  {periodTasks.map((task) => {
                    const isOverdue = !task.completed && isTaskOverdue(task.dueDate, task.dueTime);
                    const triggerDate = calculateReminderTriggerTime(task.dueDate, task.dueTime, task.reminderLeadTime);

                    return (
                      <div
                        key={task.id}
                        onClick={() => onEditTask(task)}
                        className={`relative p-3.5 rounded-xl border transition-all cursor-pointer hover:border-slate-600 ${
                          task.completed
                            ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
                            : isOverdue
                            ? 'bg-slate-900 border-rose-500/30'
                            : 'bg-slate-900/90 border-slate-800'
                        }`}
                      >
                        {/* Timeline Node Point */}
                        <div className="absolute -left-[19px] top-4.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-4 ring-slate-950" />

                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleComplete(task.id);
                              }}
                              className={`h-5 w-5 rounded flex items-center justify-center transition-colors ${
                                task.completed
                                  ? 'bg-emerald-500 text-slate-950'
                                  : 'border border-slate-600 hover:border-emerald-400'
                              }`}
                            >
                              {task.completed && <CheckCircle2 className="h-4 w-4" />}
                            </button>

                            <div className="min-w-0">
                              <h4
                                className={`text-sm font-semibold text-slate-200 truncate ${
                                  task.completed ? 'line-through text-slate-500' : ''
                                }`}
                              >
                                {task.title}
                              </h4>
                              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                                <span className="font-mono text-teal-300">
                                  {formatTimeDisplay(task.dueTime) || 'All day'}
                                </span>
                                <span>•</span>
                                <span className="text-slate-400">{task.category}</span>
                              </div>
                            </div>
                          </div>

                          {/* Reminder Time Badge */}
                          {task.reminderEnabled && !task.completed && (
                            <div className="flex-shrink-0 text-right">
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-mono">
                                <BellRing className="h-3 w-3 text-emerald-400" />
                                <span>
                                  Alert @ {triggerDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
