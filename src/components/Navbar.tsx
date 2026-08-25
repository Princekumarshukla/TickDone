import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Bell, 
  Clock, 
  Settings, 
  Plus, 
  Volume2, 
  VolumeX, 
  Calendar as CalendarIcon,
  Sparkles
} from 'lucide-react';
import { TabView, UserPreferences } from '../types';

interface NavbarProps {
  currentTab: TabView;
  onTabChange: (tab: TabView) => void;
  onOpenQuickAdd: () => void;
  onOpenReminderCenter: () => void;
  onOpenSettings: () => void;
  activeRemindersCount: number;
  unreadLogsCount: number;
  preferences: UserPreferences;
  onToggleSound: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onOpenQuickAdd,
  onOpenReminderCenter,
  onOpenSettings,
  activeRemindersCount,
  unreadLogsCount,
  preferences,
  onToggleSound,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setDateStr(
        now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems: { id: TabView; label: string; icon?: React.ReactNode }[] = [
    { id: 'today', label: 'Today' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'timeline', label: 'Schedule' },
    { id: 'all', label: 'All Tasks' },
    { id: 'completed', label: 'Completed' },
  ];

  return (
    <header id="navbar-header" className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div id="brand-logo" className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950">
              <CheckCircle2 className="h-6 w-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  TickDone
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1" />
                  Auto Reminders
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Stay on time, every time</p>
            </div>
          </div>

          {/* Center Tabs */}
          <nav id="navbar-tabs" className="hidden md:flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`tab-btn-${item.id}`}
                  onClick={() => onTabChange(item.id)}
                  className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all duration-150 ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Section: Live Clock, Reminders, Quick Add, Settings */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Live Clock Ticker */}
            <div id="live-clock-ticker" className="hidden lg:flex flex-col items-end px-3 py-1 bg-slate-800/50 rounded-lg border border-slate-700/40 text-xs">
              <span className="font-mono text-emerald-400 font-medium">{timeStr}</span>
              <span className="text-[10px] text-slate-400">{dateStr}</span>
            </div>

            {/* Quick Mute/Unmute Audio Toggle */}
            <button
              id="btn-toggle-sound"
              onClick={onToggleSound}
              title={preferences.soundEnabled ? 'Mute Alert Chimes' : 'Enable Alert Chimes'}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border border-slate-700/50"
            >
              {preferences.soundEnabled ? (
                <Volume2 className="h-4 w-4 text-emerald-400" />
              ) : (
                <VolumeX className="h-4 w-4 text-slate-500" />
              )}
            </button>

            {/* Reminders Bell / Notification Center */}
            <button
              id="btn-reminder-center"
              onClick={onOpenReminderCenter}
              title="Automated Reminders Queue & History"
              className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border border-slate-700/50"
            >
              <Bell className="h-4 w-4" />
              {activeRemindersCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-slate-950">
                  {activeRemindersCount}
                </span>
              )}
            </button>

            {/* Settings Button */}
            <button
              id="btn-open-settings"
              onClick={onOpenSettings}
              title="Preferences & Audio Options"
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border border-slate-700/50"
            >
              <Settings className="h-4 w-4" />
            </button>

            {/* Primary Quick Add Button */}
            <button
              id="btn-quick-add-task"
              onClick={onOpenQuickAdd}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-semibold text-sm transition-all shadow-md shadow-emerald-500/20"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span className="hidden sm:inline">Add Task</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1 border-t border-slate-800/60 no-scrollbar">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-tab-btn-${item.id}`}
                onClick={() => onTabChange(item.id)}
                className={`whitespace-nowrap px-3 py-1 text-xs font-medium rounded-lg ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
