import { soundManager } from './audio';
import { UserPreferences } from '../types';

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (e) {
    console.warn('Could not request notification permission', e);
    return false;
  }
}

export function hasNotificationPermission(): boolean {
  if (!('Notification' in window)) return false;
  return Notification.permission === 'granted';
}

export function triggerSystemNotification(
  title: string,
  body: string,
  options?: {
    tag?: string;
    sound?: 'chime' | 'gentle' | 'bell' | 'marimba' | 'urgent';
    preferences?: UserPreferences;
  }
) {
  // 1. Play sound if user enabled sounds
  const prefs = options?.preferences;
  if (!prefs || prefs.soundEnabled) {
    const soundType = options?.sound || prefs?.defaultSound || 'chime';
    const volume = prefs?.soundVolume ?? 0.8;
    soundManager.playReminderChime(soundType, volume);
  }

  // 2. Trigger browser notification if permitted
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      const notif = new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: options?.tag,
        requireInteraction: true,
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };
    } catch (err) {
      console.warn('System notification error', err);
    }
  }
}
