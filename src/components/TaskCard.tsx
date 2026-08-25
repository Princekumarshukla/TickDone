import React, { useState } from 'react';
import { 
  Check, 
  Clock, 
  Calendar, 
  Bell, 
  BellRing, 
  MoreVertical, 
  Trash2, 
  Edit3, 
  CheckSquare, 
  Square, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  Repeat,
  Sparkles,
  Volume2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task, SubTask, Priority } from '../types';
import { 
  formatFriendlyDate, 
  formatTimeDisplay, 
  getRelativeTimeRemaining, 
  isTaskOverdue, 
  getLeadTimeLabel 
} from '../utils/dateUtils';
import { soundManager } from '../utils/audio';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onSnoozeTask: (taskId: string, minutes: number) => void;
  onTriggerInstantReminderTest: (task: Task) => void;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Work: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
  Personal: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  Health: { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/20' },
  Finance: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  Shopping: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
  Study: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/20' },
  Family: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  onToggleSubtask,
  onSnoozeTask,
  onTriggerInstantReminderTest,
}) => {
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const isOverdue = !task.completed && isTaskOverdue(task.dueDate, task.dueTime);
  const relativeTime = getRelativeTimeRemaining(task.dueDate, task.dueTime);
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;

  const categoryStyle = CATEGORY_COLORS[task.category] || {
    bg: 'bg-slate-800',
    text: 'text-slate-300',
    border: 'border-slate-700',
  };

  const handleCompleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task.completed) {
      soundManager.playCompletionTick();
      confetti({
        particleCount: 40,
        spread: 60,
        origin: {
          x: e.clientX / window.innerWidth,
          y: e.clientY / window.innerHeight,
        },
        colors: ['#10B981', '#14B8A6', '#38BDF8', '#F59E0B'],
      });
    }
    onToggleComplete(task.id);
  };

  return (
    <div
      id={`task-card-${task.id}`}
      className={`group relative rounded-2xl border transition-all duration-200 ${
        task.completed
          ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
          : isOverdue
          ? 'bg-slate-900 border-rose-500/30 hover:border-rose-500/50 shadow-md shadow-rose-950/10'
          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-md hover:shadow-lg'
      } p-4 sm:p-5`}
    >
      <div className="flex items-start gap-3.5">
        
        {/* Task Completion Checkbox */}
        <button
          id={`task-complete-toggle-${task.id}`}
          onClick={handleCompleteClick}
          className={`flex-shrink-0 mt-0.5 h-6 w-6 rounded-lg flex items-center justify-center transition-all duration-150 ${
            task.completed
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'border-2 border-slate-600 hover:border-emerald-400 bg-slate-800/50 group-hover:bg-slate-800'
          }`}
          title={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {task.completed && <Check className="h-4 w-4 stroke-[3]" />}
        </button>

        {/* Task Main Content */}
        <div className="flex-1 min-w-0">
          
          {/* Header Line: Category, Priority, Recurrence, Automated Reminder Pill */}
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            
            {/* Category Tag */}
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}
            >
              {task.category}
            </span>

            {/* Priority Indicator */}
            {task.priority === 'urgent' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
                Urgent
              </span>
            )}
            {task.priority === 'high' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                High Priority
              </span>
            )}

            {/* Recurring Rule */}
            {task.recurrence && task.recurrence !== 'none' && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700/60">
                <Repeat className="h-3 w-3 text-slate-400" />
                <span className="capitalize">{task.recurrence}</span>
              </span>
            )}

            {/* Automated Reminder Status Badge */}
            {task.reminderEnabled && !task.completed && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                title={`Reminder set: ${getLeadTimeLabel(task.reminderLeadTime)} (Sound: ${task.reminderSound})`}
              >
                <BellRing className="h-3 w-3 text-emerald-400" />
                <span>{getLeadTimeLabel(task.reminderLeadTime)}</span>
              </span>
            )}

            {/* Snoozed Badge */}
            {task.snoozedUntil && new Date(task.snoozedUntil) > new Date() && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
                <span>💤 Snoozed</span>
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            className={`text-base font-semibold text-slate-100 break-words ${
              task.completed ? 'line-through text-slate-500' : ''
            }`}
          >
            {task.title}
          </h3>

          {/* Notes description if available */}
          {task.notes && (
            <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
              {task.notes}
            </p>
          )}

          {/* Date, Time & Countdown Bar */}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
            
            {/* Due Date */}
            <div className="flex items-center gap-1 text-slate-400">
              <Calendar className="h-3.5 w-3.5 text-slate-500" />
              <span>{formatFriendlyDate(task.dueDate)}</span>
            </div>

            {/* Due Time */}
            {task.dueTime && (
              <div className="flex items-center gap-1 text-slate-400">
                <Clock className="h-3.5 w-3.5 text-slate-500" />
                <span>{formatTimeDisplay(task.dueTime)}</span>
              </div>
            )}

            {/* Relative Countdown or Overdue Indicator */}
            {!task.completed && (
              <div
                className={`inline-flex items-center gap-1 font-medium px-2 py-0.5 rounded-full text-[11px] ${
                  isOverdue
                    ? 'bg-rose-500/20 text-rose-300 font-semibold'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                {isOverdue && <AlertCircle className="h-3 w-3 text-rose-400" />}
                <span>{relativeTime.text}</span>
              </div>
            )}

            {/* Subtasks Count toggle */}
            {totalSubtasks > 0 && (
              <button
                type="button"
                id={`btn-toggle-subtasks-${task.id}`}
                onClick={() => setShowSubtasks(!showSubtasks)}
                className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors ml-auto text-xs"
              >
                <CheckSquare className="h-3.5 w-3.5 text-emerald-400" />
                <span>
                  {completedSubtasks}/{totalSubtasks} Subtasks
                </span>
                {showSubtasks ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </button>
            )}
          </div>

          {/* Subtasks Accordion List */}
          {showSubtasks && totalSubtasks > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-800 space-y-1.5">
              {task.subtasks.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => onToggleSubtask(task.id, sub.id)}
                  className="flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-slate-800/60 cursor-pointer text-xs group/sub"
                >
                  <div
                    className={`h-4 w-4 rounded flex items-center justify-center border transition-colors ${
                      sub.completed
                        ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                        : 'border-slate-600 group-hover/sub:border-emerald-400'
                    }`}
                  >
                    {sub.completed && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>
                  <span
                    className={`flex-1 ${
                      sub.completed ? 'line-through text-slate-500' : 'text-slate-300'
                    }`}
                  >
                    {sub.title}
                  </span>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Action Menu (Edit, Quick Snooze, Trigger Test, Delete) */}
        <div className="relative flex-shrink-0">
          <button
            id={`task-menu-btn-${task.id}`}
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div
                id={`task-dropdown-${task.id}`}
                className="absolute right-0 top-8 z-20 w-48 rounded-xl bg-slate-800 border border-slate-700 shadow-xl py-1 text-xs text-slate-200"
              >
                {/* Edit Task */}
                <button
                  id={`btn-edit-task-${task.id}`}
                  onClick={() => {
                    setShowMenu(false);
                    onEditTask(task);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-slate-700/80 transition-colors"
                >
                  <Edit3 className="h-3.5 w-3.5 text-slate-400" />
                  <span>Edit Details & Reminder</span>
                </button>

                {/* Instant Test Alert */}
                <button
                  id={`btn-test-alert-${task.id}`}
                  onClick={() => {
                    setShowMenu(false);
                    onTriggerInstantReminderTest(task);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-slate-700/80 text-emerald-300 transition-colors"
                >
                  <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Test Automated Reminder Now</span>
                </button>

                {/* Snooze Options */}
                {!task.completed && (
                  <div className="border-t border-slate-700/60 my-1 py-1">
                    <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase">
                      Quick Snooze
                    </div>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onSnoozeTask(task.id, 10);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-1.5 text-left hover:bg-slate-700/80 transition-colors"
                    >
                      <span>💤 Snooze 10 min</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onSnoozeTask(task.id, 60);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-1.5 text-left hover:bg-slate-700/80 transition-colors"
                    >
                      <span>💤 Snooze 1 hour</span>
                    </button>
                  </div>
                )}

                {/* Delete Task */}
                <div className="border-t border-slate-700/60 my-1 pt-1">
                  <button
                    id={`btn-delete-task-${task.id}`}
                    onClick={() => {
                      setShowMenu(false);
                      onDeleteTask(task.id);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-rose-950/40 text-rose-400 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete Task</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
