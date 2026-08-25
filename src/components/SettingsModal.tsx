import React from 'react';
import { 
  X, 
  Volume2, 
  VolumeX, 
  Bell, 
  ShieldCheck, 
  Download, 
  Upload, 
  Trash2, 
  Clock,
  Sparkles
} from 'lucide-react';
import { UserPreferences, ReminderLeadTime, Task } from '../types';
import { soundManager } from '../utils/audio';
import { requestNotificationPermission, hasNotificationPermission } from '../utils/notifications';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => void;
  tasks: Task[];
  onImportTasks: (tasks: Task[]) => void;
  onClearCompletedTasks: () => void;
}

const SOUNDS = [
  { id: 'chime', name: 'Classic Crystal Chime' },
  { id: 'gentle', name: 'Gentle Ascending Triad' },
  { id: 'bell', name: 'Resonant Tibetan Bell' },
  { id: 'marimba', name: 'Acoustic Marimba Tap' },
  { id: 'urgent', name: 'High Priority Alert' },
] as const;

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onUpdatePreferences,
  tasks,
  onImportTasks,
  onClearCompletedTasks,
}) => {
  if (!isOpen) return null;

  const handleTestChime = (sound: 'chime' | 'gentle' | 'bell' | 'marimba' | 'urgent') => {
    soundManager.playReminderChime(sound, preferences.soundVolume);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `tickdone_tasks_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            onImportTasks(parsed);
            alert(`Successfully imported ${parsed.length} tasks!`);
          }
        } catch (err) {
          alert('Invalid JSON task backup file format.');
        }
      };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div
        id="settings-modal-dialog"
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
              <Volume2 className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">TickDone Preferences</h2>
              <p className="text-xs text-slate-400">Audio chime engine & reminder defaults</p>
            </div>
          </div>
          <button
            id="btn-close-settings"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          
          {/* Audio Chimes Config */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Harmonic Sound Engine
            </h3>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <div className="flex items-center gap-3">
                {preferences.soundEnabled ? (
                  <Volume2 className="h-5 w-5 text-emerald-400" />
                ) : (
                  <VolumeX className="h-5 w-5 text-slate-500" />
                )}
                <div>
                  <p className="font-semibold text-white">Sound Alerts Enabled</p>
                  <p className="text-xs text-slate-400">Play chime when automated reminders trigger</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  id="toggle-sound-enabled"
                  type="checkbox"
                  checked={preferences.soundEnabled}
                  onChange={(e) => onUpdatePreferences({ soundEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {/* Volume Slider */}
            {preferences.soundEnabled && (
              <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Chime Volume</span>
                  <span className="font-mono text-emerald-400">
                    {Math.round(preferences.soundVolume * 100)}%
                  </span>
                </div>
                <input
                  id="range-sound-volume"
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={preferences.soundVolume}
                  onChange={(e) => onUpdatePreferences({ soundVolume: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>
            )}

            {/* Chime Sound Options List */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">
                Default Reminder Sound Chime
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SOUNDS.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => onUpdatePreferences({ defaultSound: s.id })}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      preferences.defaultSound === s.id
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-800/40 border-slate-700/50 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-xs font-medium">{s.name}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTestChime(s.id);
                      }}
                      className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 transition-colors"
                      title="Play Preview"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Default Reminder Lead Time */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Reminder Defaults
            </h3>
            
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <div>
                <p className="font-semibold text-white">Default Alert Lead Time</p>
                <p className="text-xs text-slate-400">Pre-selected timing when creating new tasks</p>
              </div>
              <select
                id="select-pref-default-lead-time"
                value={preferences.defaultLeadTime}
                onChange={(e) => onUpdatePreferences({ defaultLeadTime: e.target.value as ReminderLeadTime })}
                className="bg-slate-800 border border-slate-700 text-emerald-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none"
              >
                <option value="at_time">At exact task time</option>
                <option value="5m">5 minutes before</option>
                <option value="15m">15 minutes before</option>
                <option value="30m">30 minutes before</option>
                <option value="1h">1 hour before</option>
              </select>
            </div>
          </div>

          {/* Data Backup & Cleanup */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Data Management & Backup
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                id="btn-export-json"
                onClick={handleExportJSON}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-colors"
              >
                <Download className="h-4 w-4 text-emerald-400" />
                <span>Export Tasks JSON</span>
              </button>

              <label className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer">
                <Upload className="h-4 w-4 text-teal-400" />
                <span>Import Tasks JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
            </div>

            <button
              id="btn-clear-completed-tasks"
              onClick={onClearCompletedTasks}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-medium transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear All Completed Tasks</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 border-t border-slate-800 bg-slate-900/90">
          <button
            id="btn-done-settings"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
