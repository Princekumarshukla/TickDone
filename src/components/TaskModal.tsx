import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Bell, 
  Flag, 
  Tag, 
  Repeat, 
  CheckSquare, 
  Plus, 
  Trash2, 
  Volume2,
  Sparkles
} from 'lucide-react';
import { Task, Priority, Category, ReminderLeadTime, RecurrenceRule, SubTask } from '../types';
import { getTodayDateString, getCurrentTimeString } from '../utils/dateUtils';
import { soundManager } from '../utils/audio';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTask: (task: Task) => void;
  initialTask?: Task | null;
}

const CATEGORIES: Category[] = ['Work', 'Personal', 'Health', 'Finance', 'Shopping', 'Study', 'Family'];

const SOUND_OPTIONS: { id: 'chime' | 'gentle' | 'bell' | 'marimba' | 'urgent'; label: string }[] = [
  { id: 'chime', label: 'Classic Crystal Chime' },
  { id: 'gentle', label: 'Gentle Ascending Triad' },
  { id: 'bell', label: 'Resonant Tibetan Bell' },
  { id: 'marimba', label: 'Acoustic Marimba Tap' },
  { id: 'urgent', label: 'High Priority Alert' },
];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSaveTask,
  initialTask,
}) => {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState<Category>('Work');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState(getTodayDateString());
  const [dueTime, setDueTime] = useState('17:00');
  const [recurrence, setRecurrence] = useState<RecurrenceRule>('none');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(30);

  // Reminder settings
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderLeadTime, setReminderLeadTime] = useState<ReminderLeadTime>('15m');
  const [reminderSound, setReminderSound] = useState<'chime' | 'gentle' | 'bell' | 'marimba' | 'urgent'>('chime');

  // Subtasks
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setNotes(initialTask.notes || '');
      setCategory(initialTask.category as Category);
      setPriority(initialTask.priority);
      setDueDate(initialTask.dueDate);
      setDueTime(initialTask.dueTime || '17:00');
      setRecurrence(initialTask.recurrence || 'none');
      setEstimatedMinutes(initialTask.estimatedMinutes || 30);
      setReminderEnabled(initialTask.reminderEnabled);
      setReminderLeadTime(initialTask.reminderLeadTime);
      setReminderSound(initialTask.reminderSound);
      setSubtasks(initialTask.subtasks ? [...initialTask.subtasks] : []);
    } else {
      setTitle('');
      setNotes('');
      setCategory('Work');
      setPriority('medium');
      setDueDate(getTodayDateString());
      setDueTime('17:00');
      setRecurrence('none');
      setEstimatedMinutes(30);
      setReminderEnabled(true);
      setReminderLeadTime('15m');
      setReminderSound('chime');
      setSubtasks([]);
    }
  }, [initialTask, isOpen]);

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([
      ...subtasks,
      {
        id: `sub-${Date.now()}`,
        title: newSubtaskTitle.trim(),
        completed: false,
      },
    ]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const handleTestSound = (soundType: 'chime' | 'gentle' | 'bell' | 'marimba' | 'urgent') => {
    soundManager.playReminderChime(soundType, 0.8);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskToSave: Task = {
      id: initialTask ? initialTask.id : `task-${Date.now()}`,
      title: title.trim(),
      notes: notes.trim() || undefined,
      category,
      priority,
      dueDate,
      dueTime: dueTime || undefined,
      completed: initialTask ? initialTask.completed : false,
      completedAt: initialTask ? initialTask.completedAt : undefined,
      createdAt: initialTask ? initialTask.createdAt : new Date().toISOString(),
      reminderEnabled,
      reminderLeadTime,
      reminderSound,
      recurrence,
      estimatedMinutes: Number(estimatedMinutes) || 30,
      subtasks,
    };

    onSaveTask(taskToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div
        id="task-modal-dialog"
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckSquare className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {initialTask ? 'Edit Task & Reminder' : 'Create New Scheduled Task'}
              </h2>
              <p className="text-xs text-slate-400">Configure automated alerts and timelines</p>
            </div>
          </div>
          <button
            id="btn-close-task-modal"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          
          {/* Task Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Task Title <span className="text-rose-400">*</span>
            </label>
            <input
              id="input-task-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Deliver Quarterly Strategy Report"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Notes / Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Notes & Context
            </label>
            <textarea
              id="input-task-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add links, sub-notes, or key details..."
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Due Date & Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Due Date
              </label>
              <div className="relative">
                <input
                  id="input-task-due-date"
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Due Time
              </label>
              <div className="relative">
                <input
                  id="input-task-due-time"
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Automated Reminder Section */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-emerald-500/20 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-semibold text-white">Automated Reminder</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  id="input-toggle-reminder"
                  type="checkbox"
                  checked={reminderEnabled}
                  onChange={(e) => setReminderEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {reminderEnabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-700/60">
                {/* Reminder Lead Time */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-medium">
                    Trigger Alert
                  </label>
                  <select
                    id="select-reminder-lead-time"
                    value={reminderLeadTime}
                    onChange={(e) => setReminderLeadTime(e.target.value as ReminderLeadTime)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-emerald-300 focus:outline-none"
                  >
                    <option value="at_time">At exact task time</option>
                    <option value="5m">5 minutes before</option>
                    <option value="15m">15 minutes before</option>
                    <option value="30m">30 minutes before</option>
                    <option value="1h">1 hour before</option>
                    <option value="2h">2 hours before</option>
                    <option value="1d">1 day before</option>
                  </select>
                </div>

                {/* Reminder Chime & Sound Preview */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-medium">
                    Harmonic Sound Chime
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      id="select-reminder-sound"
                      value={reminderSound}
                      onChange={(e) => setReminderSound(e.target.value as 'chime' | 'gentle' | 'bell' | 'marimba' | 'urgent')}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
                    >
                      {SOUND_OPTIONS.map((snd) => (
                        <option key={snd.id} value={snd.id}>
                          {snd.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      id="btn-preview-sound-modal"
                      onClick={() => handleTestSound(reminderSound)}
                      title="Preview this chime"
                      className="p-2 rounded-lg bg-slate-700 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 transition-colors"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Category, Priority & Recurrence */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Category
              </label>
              <select
                id="select-task-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Priority
              </label>
              <select
                id="select-task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent 🔥</option>
              </select>
            </div>

            {/* Recurrence */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Recurrence
              </label>
              <select
                id="select-task-recurrence"
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as RecurrenceRule)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none"
              >
                <option value="none">One-time</option>
                <option value="daily">Daily</option>
                <option value="weekdays">Weekdays (Mon-Fri)</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

          </div>

          {/* Subtasks / Checklist Builder */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Checklist / Subtasks ({subtasks.length})
            </label>
            
            <div className="space-y-2 mb-2">
              {subtasks.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-2 text-xs"
                >
                  <span className="text-slate-200">{sub.title}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(sub.id)}
                    className="text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                id="input-new-subtask"
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Add checklist item and press enter..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                type="button"
                id="btn-add-subtask"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-medium text-slate-200"
              >
                Add
              </button>
            </div>
          </div>

          {/* Footer Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              id="btn-cancel-modal"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-submit-task-modal"
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition-all shadow-md shadow-emerald-500/20"
            >
              {initialTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
