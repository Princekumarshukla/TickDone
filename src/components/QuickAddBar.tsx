import React, { useState } from 'react';
import { 
  Plus, 
  Calendar, 
  Clock, 
  Bell, 
  Flag, 
  Tag,
  CornerDownLeft,
  ChevronDown
} from 'lucide-react';
import { Priority, Category, ReminderLeadTime, RecurrenceRule } from '../types';
import { getTodayDateString, getCurrentTimeString } from '../utils/dateUtils';

interface QuickAddBarProps {
  onAddTask: (taskData: {
    title: string;
    dueDate: string;
    dueTime?: string;
    priority: Priority;
    category: Category | string;
    reminderEnabled: boolean;
    reminderLeadTime: ReminderLeadTime;
  }) => void;
}

const CATEGORIES: Category[] = ['Work', 'Personal', 'Health', 'Finance', 'Shopping', 'Study', 'Family'];

export const QuickAddBar: React.FC<QuickAddBarProps> = ({ onAddTask }) => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(getTodayDateString());
  const [dueTime, setDueTime] = useState('17:00');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<Category>('Work');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderLeadTime, setReminderLeadTime] = useState<ReminderLeadTime>('15m');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      dueDate,
      dueTime: dueTime || undefined,
      priority,
      category,
      reminderEnabled,
      reminderLeadTime,
    });

    setTitle('');
    setIsExpanded(false);
  };

  const priorityColors = {
    low: 'text-slate-400 border-slate-700 bg-slate-800/60',
    medium: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
    high: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    urgent: 'text-rose-400 border-rose-500/30 bg-rose-500/10 font-bold',
  };

  return (
    <form
      id="quick-add-bar-form"
      onSubmit={handleSubmit}
      className={`mb-6 transition-all duration-200 bg-slate-900 border rounded-2xl p-3 sm:p-4 shadow-lg ${
        isExpanded ? 'border-emerald-500/50 shadow-emerald-500/5' : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="flex items-center gap-3">
        
        {/* Plus Icon Accent */}
        <div className="flex-shrink-0 text-emerald-400">
          <Plus className="h-5 w-5" />
        </div>

        {/* Input Field */}
        <input
          id="quick-add-title-input"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          placeholder="Add a new task with automated reminder (e.g., 'Finish project review at 3 PM')..."
          className="flex-1 bg-transparent text-white placeholder-slate-500 text-sm sm:text-base focus:outline-none"
        />

        {/* Submit Action */}
        <button
          id="btn-quick-add-submit"
          type="submit"
          disabled={!title.trim()}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500 text-slate-950 font-semibold text-xs sm:text-sm transition-all"
        >
          <span>Add</span>
          <CornerDownLeft className="h-3.5 w-3.5 hidden sm:inline" />
        </button>
      </div>

      {/* Expanded Quick Options */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Left Controls: Due Date, Due Time, Category, Priority */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Due Date */}
            <div className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60 text-slate-300">
              <Calendar className="h-3.5 w-3.5 text-emerald-400" />
              <input
                id="quick-add-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
              />
            </div>

            {/* Due Time */}
            <div className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60 text-slate-300">
              <Clock className="h-3.5 w-3.5 text-teal-400" />
              <input
                id="quick-add-due-time"
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
              />
            </div>

            {/* Category Dropdown */}
            <div className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60 text-slate-300">
              <Tag className="h-3.5 w-3.5 text-purple-400" />
              <select
                id="quick-add-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-slate-900 text-slate-200">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Selector */}
            <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700/60">
              <Flag className="h-3.5 w-3.5 text-amber-400" />
              {(['low', 'medium', 'high', 'urgent'] as Priority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  id={`quick-add-priority-${p}`}
                  onClick={() => setPriority(p)}
                  className={`px-1.5 py-0.5 rounded text-[11px] font-medium capitalize transition-all ${
                    priority === p ? priorityColors[p] : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Right Controls: Automated Reminder Settings */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="quick-add-toggle-reminder"
              onClick={() => setReminderEnabled(!reminderEnabled)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all ${
                reminderEnabled
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-800/60 text-slate-500 border-slate-700/50'
              }`}
            >
              <Bell className={`h-3.5 w-3.5 ${reminderEnabled ? 'fill-emerald-500/20' : ''}`} />
              <span className="text-xs font-medium">
                {reminderEnabled ? 'Reminder On' : 'Reminder Off'}
              </span>
            </button>

            {reminderEnabled && (
              <select
                id="quick-add-lead-time-select"
                value={reminderLeadTime}
                onChange={(e) => setReminderLeadTime(e.target.value as ReminderLeadTime)}
                className="bg-slate-800 text-emerald-300 border border-slate-700/80 rounded-lg px-2 py-1.5 text-xs focus:outline-none cursor-pointer"
              >
                <option value="at_time">At task time</option>
                <option value="5m">5 mins before</option>
                <option value="15m">15 mins before</option>
                <option value="30m">30 mins before</option>
                <option value="1h">1 hour before</option>
              </select>
            )}
          </div>
        </div>
      )}
    </form>
  );
};
