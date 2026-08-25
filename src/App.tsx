/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Calendar, 
  CheckCircle2, 
  Bell, 
  Clock, 
  ListOrdered, 
  Sparkles,
  Inbox,
  AlertCircle,
  Tag
} from 'lucide-react';
import { 
  Task, 
  TabView, 
  UserPreferences, 
  ActiveReminderAlert, 
  ReminderNotificationLog, 
  Priority, 
  Category, 
  ReminderLeadTime 
} from './types';
import { 
  loadTasksFromStorage, 
  saveTasksToStorage, 
  loadPreferences, 
  savePreferences, 
  loadReminderLogs, 
  saveReminderLogs 
} from './utils/storage';
import { 
  getTodayDateString, 
  isTaskDueToday, 
  isTaskOverdue, 
  calculateReminderTriggerTime, 
  getLeadTimeLabel 
} from './utils/dateUtils';
import { triggerSystemNotification } from './utils/notifications';
import { soundManager } from './utils/audio';

import { Navbar } from './components/Navbar';
import { StatsBanner } from './components/StatsBanner';
import { QuickAddBar } from './components/QuickAddBar';
import { TaskCard } from './components/TaskCard';
import { TaskModal } from './components/TaskModal';
import { ReminderAlertModal } from './components/ReminderAlertModal';
import { ReminderCenter } from './components/ReminderCenter';
import { TodayTimeline } from './components/TodayTimeline';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  // State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>(loadPreferences);
  const [reminderLogs, setReminderLogs] = useState<ReminderNotificationLog[]>(loadReminderLogs);
  const [currentTab, setCurrentTab] = useState<TabView>('today');
  
  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'due' | 'priority' | 'title'>('due');

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isReminderCenterOpen, setIsReminderCenterOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeAlert, setActiveAlert] = useState<ActiveReminderAlert | null>(null);

  // Track triggered task IDs in current runtime session to avoid spamming
  const triggeredSessionsRef = useRef<Set<string>>(new Set());

  // Load initial tasks on mount
  useEffect(() => {
    const loaded = loadTasksFromStorage();
    setTasks(loaded);
  }, []);

  // Save tasks on changes
  useEffect(() => {
    if (tasks.length > 0) {
      saveTasksToStorage(tasks);
    }
  }, [tasks]);

  // Save preferences
  useEffect(() => {
    savePreferences(preferences);
  }, [preferences]);

  // Save logs
  useEffect(() => {
    saveReminderLogs(reminderLogs);
  }, [reminderLogs]);

  // =========================================================================
  // AUTOMATED REMINDER ENGINE (Background loop checking every 5 seconds)
  // =========================================================================
  useEffect(() => {
    const checkReminders = () => {
      const now = Date.now();

      tasks.forEach((task) => {
        if (task.completed || !task.reminderEnabled) return;

        // Determine if task has snoozedUntil
        if (task.snoozedUntil) {
          const snoozeDate = new Date(task.snoozedUntil).getTime();
          if (now >= snoozeDate && !triggeredSessionsRef.current.has(`${task.id}-snoozed-${task.snoozedUntil}`)) {
            triggeredSessionsRef.current.add(`${task.id}-snoozed-${task.snoozedUntil}`);
            triggerReminderAlert(task, 'Snoozed alert time reached');
          }
          return;
        }

        // Calculate trigger timestamp
        const triggerDate = calculateReminderTriggerTime(
          task.dueDate,
          task.dueTime,
          task.reminderLeadTime
        ).getTime();

        // Check if within trigger window: now is >= triggerDate and triggerDate was within the last 15 minutes
        const diff = now - triggerDate;
        const isTriggerTime = diff >= 0 && diff <= 15 * 60 * 1000;

        const sessionKey = `${task.id}-${task.dueDate}-${task.dueTime || 'default'}-${task.reminderLeadTime}`;

        if (isTriggerTime && !triggeredSessionsRef.current.has(sessionKey)) {
          triggeredSessionsRef.current.add(sessionKey);
          const leadLabel = getLeadTimeLabel(task.reminderLeadTime);
          triggerReminderAlert(task, leadLabel);
        }
      });
    };

    checkReminders();
    const interval = setInterval(checkReminders, 5000);
    return () => clearInterval(interval);
  }, [tasks, preferences]);

  const triggerReminderAlert = (task: Task, leadTimeLabel: string) => {
    const alertObj: ActiveReminderAlert = {
      taskId: task.id,
      taskTitle: task.title,
      taskCategory: task.category,
      taskPriority: task.priority,
      dueDate: task.dueDate,
      dueTime: task.dueTime,
      leadTimeLabel,
      triggeredAt: new Date().toISOString(),
      sound: task.reminderSound || preferences.defaultSound,
    };

    setActiveAlert(alertObj);

    // Browser Notification & Sound
    triggerSystemNotification(
      `Reminder: ${task.title}`,
      `Task is scheduled for ${task.dueDate} ${task.dueTime ? `at ${task.dueTime}` : ''} (${leadTimeLabel})`,
      {
        sound: task.reminderSound || preferences.defaultSound,
        preferences,
        tag: `tickdone-${task.id}`,
      }
    );

    // Add to logs
    const newLog: ReminderNotificationLog = {
      id: `log-${Date.now()}`,
      taskId: task.id,
      taskTitle: task.title,
      triggeredAt: new Date().toISOString(),
      type: 'due',
      dismissed: false,
    };
    setReminderLogs((prev) => [newLog, ...prev.slice(0, 49)]);
  };

  // =========================================================================
  // TASK ACTIONS
  // =========================================================================

  const handleToggleComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const nextCompleted = !t.completed;
        return {
          ...t,
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date().toISOString() : undefined,
        };
      })
    );
  };

  const handleSaveTask = (taskToSave: Task) => {
    setTasks((prev) => {
      const exists = prev.some((t) => t.id === taskToSave.id);
      if (exists) {
        return prev.map((t) => (t.id === taskToSave.id ? taskToSave : t));
      }
      return [taskToSave, ...prev];
    });
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const nextSubs = t.subtasks.map((s) =>
          s.id === subtaskId ? { ...s, completed: !s.completed } : s
        );
        return { ...t, subtasks: nextSubs };
      })
    );
  };

  const handleSnoozeTask = (taskId: string, minutes: number) => {
    const snoozeTime = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, snoozedUntil: snoozeTime } : t))
    );
    if (activeAlert?.taskId === taskId) {
      setActiveAlert(null);
    }
  };

  const handleQuickAdd = (taskData: {
    title: string;
    dueDate: string;
    dueTime?: string;
    priority: Priority;
    category: Category | string;
    reminderEnabled: boolean;
    reminderLeadTime: ReminderLeadTime;
  }) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: taskData.title,
      dueDate: taskData.dueDate,
      dueTime: taskData.dueTime,
      priority: taskData.priority,
      category: taskData.category,
      completed: false,
      createdAt: new Date().toISOString(),
      reminderEnabled: taskData.reminderEnabled,
      reminderLeadTime: taskData.reminderLeadTime,
      reminderSound: preferences.defaultSound,
      recurrence: 'none',
      subtasks: [],
    };
    handleSaveTask(newTask);
  };

  const handleTriggerTest = (task: Task) => {
    triggerReminderAlert(task, `Manual test of ${getLeadTimeLabel(task.reminderLeadTime)}`);
  };

  // =========================================================================
  // FILTERED & SORTED TASKS
  // =========================================================================

  const filteredTasks = useMemo(() => {
    const todayStr = getTodayDateString();

    return tasks.filter((task) => {
      // Tab filter
      if (currentTab === 'today') {
        if (task.dueDate !== todayStr && !isTaskOverdue(task.dueDate, task.dueTime)) {
          return false;
        }
      } else if (currentTab === 'upcoming') {
        if (task.dueDate <= todayStr || task.completed) return false;
      } else if (currentTab === 'completed') {
        if (!task.completed) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesNotes = task.notes?.toLowerCase().includes(query);
        const matchesCategory = task.category.toLowerCase().includes(query);
        if (!matchesTitle && !matchesNotes && !matchesCategory) return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && task.category !== selectedCategory) {
        return false;
      }

      // Priority filter
      if (selectedPriority !== 'all' && task.priority !== selectedPriority) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
        return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      // Default: sort by due date + due time
      const timeA = a.dueDate + (a.dueTime || '23:59');
      const timeB = b.dueDate + (b.dueTime || '23:59');
      return timeA.localeCompare(timeB);
    });
  }, [tasks, currentTab, searchQuery, selectedCategory, selectedPriority, sortBy]);

  const activeRemindersCount = useMemo(() => {
    return tasks.filter((t) => !t.completed && t.reminderEnabled).length;
  }, [tasks]);

  return (
    <div id="tickdone-app-root" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenQuickAdd={() => {
          setEditingTask(null);
          setIsTaskModalOpen(true);
        }}
        onOpenReminderCenter={() => setIsReminderCenterOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeRemindersCount={activeRemindersCount}
        unreadLogsCount={reminderLogs.length}
        preferences={preferences}
        onToggleSound={() =>
          setPreferences((p) => ({ ...p, soundEnabled: !p.soundEnabled }))
        }
      />

      {/* Main Content Area */}
      <main id="main-content-layout" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Daily Stats & Goal Banner */}
        <StatsBanner
          tasks={tasks}
          onFilterOverdue={() => {
            setCurrentTab('today');
            setSelectedPriority('urgent');
          }}
          onOpenReminderCenter={() => setIsReminderCenterOpen(true)}
        />

        {/* Inline Quick Add Bar */}
        <QuickAddBar onAddTask={handleQuickAdd} />

        {/* Schedule / Timeline View Tab */}
        {currentTab === 'timeline' ? (
          <TodayTimeline
            tasks={tasks}
            onToggleComplete={handleToggleComplete}
            onEditTask={(task) => {
              setEditingTask(task);
              setIsTaskModalOpen(true);
            }}
          />
        ) : (
          <div className="space-y-5">
            
            {/* Search & Filter Toolbar */}
            <div id="filter-toolbar" className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80">
              
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  id="input-search-tasks"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tasks, notes, or tags..."
                  className="w-full bg-slate-800/80 border border-slate-700/60 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              {/* Filter Controls Row */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                
                {/* Category Filter */}
                <select
                  id="select-filter-category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  <option value="Work">Work</option>
                  <option value="Personal">Personal</option>
                  <option value="Health">Health</option>
                  <option value="Finance">Finance</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Study">Study</option>
                  <option value="Family">Family</option>
                </select>

                {/* Priority Filter */}
                <select
                  id="select-filter-priority"
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                {/* Sort By */}
                <select
                  id="select-sort-by"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'due' | 'priority' | 'title')}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="due">Sort by Due Time</option>
                  <option value="priority">Sort by Priority</option>
                  <option value="title">Sort by Title</option>
                </select>

              </div>
            </div>

            {/* Task List Header with Count */}
            <div className="flex items-center justify-between px-1 text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-slate-300">
                {currentTab === 'today'
                  ? "Today's Agenda & Action Items"
                  : currentTab === 'upcoming'
                  ? 'Upcoming Tasks & Reminders'
                  : currentTab === 'completed'
                  ? 'Completed Tasks Archive'
                  : 'All Tasks'}
              </span>
              <span className="font-mono text-emerald-400 font-medium">
                {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
              </span>
            </div>

            {/* Tasks Cards Grid / List */}
            {filteredTasks.length === 0 ? (
              <div id="empty-state-card" className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800/80">
                <Inbox className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-slate-300">No Tasks Found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {searchQuery || selectedCategory !== 'all' || selectedPriority !== 'all'
                    ? 'Try adjusting your search query or filters above.'
                    : 'Add a new task using the quick add bar above to get started.'}
                </p>
                <button
                  id="btn-empty-state-add"
                  onClick={() => {
                    setEditingTask(null);
                    setIsTaskModalOpen(true);
                  }}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-xl shadow-md transition-all"
                >
                  <Plus className="h-4 w-4 stroke-[3]" />
                  <span>Create Task with Reminder</span>
                </button>
              </div>
            ) : (
              <div id="task-cards-list" className="space-y-3">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleComplete={handleToggleComplete}
                    onEditTask={(t) => {
                      setEditingTask(t);
                      setIsTaskModalOpen(true);
                    }}
                    onDeleteTask={handleDeleteTask}
                    onToggleSubtask={handleToggleSubtask}
                    onSnoozeTask={handleSnoozeTask}
                    onTriggerInstantReminderTest={handleTriggerTest}
                  />
                ))}
              </div>
            )}

          </div>
        )}

      </main>

      {/* Full Task Create / Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSaveTask={handleSaveTask}
        initialTask={editingTask}
      />

      {/* Automated Reminder Alert Alarm Popup */}
      <ReminderAlertModal
        alert={activeAlert}
        onDismiss={() => setActiveAlert(null)}
        onComplete={(taskId) => {
          handleToggleComplete(taskId);
          setActiveAlert(null);
        }}
        onSnooze={(taskId, minutes) => {
          handleSnoozeTask(taskId, minutes);
        }}
      />

      {/* Reminders Center Drawer */}
      <ReminderCenter
        isOpen={isReminderCenterOpen}
        onClose={() => setIsReminderCenterOpen(false)}
        tasks={tasks}
        logs={reminderLogs}
        onClearLogs={() => setReminderLogs([])}
        onTriggerTestAlarm={handleTriggerTest}
        preferences={preferences}
        onUpdatePreferences={(newPrefs) =>
          setPreferences((prev) => ({ ...prev, ...newPrefs }))
        }
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        preferences={preferences}
        onUpdatePreferences={(newPrefs) =>
          setPreferences((prev) => ({ ...prev, ...newPrefs }))
        }
        tasks={tasks}
        onImportTasks={(imported) => setTasks(imported)}
        onClearCompletedTasks={() =>
          setTasks((prev) => prev.filter((t) => !t.completed))
        }
      />

      {/* Clean Minimal Footer */}
      <footer className="mt-auto border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="flex items-center justify-center gap-2">
          <span>TickDone Task Management & Automated Reminders</span>
          <span>•</span>
          <span className="text-emerald-500/80 font-medium">Harmonic Audio Engine Active</span>
        </div>
      </footer>

    </div>
  );
}
