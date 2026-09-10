const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  'BChxwzPSfiV0a-BbjUvVsltvjLKblgVNMRTT9eRCIijwYDOXfKBNMdBYqQ46BMuGfHW6YPDahzVNnn5gYQvbGJA';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

function urlB64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Registers the Service Worker and requests Web Push subscription for this host.
 */
export async function registerHostPushSubscription(hostId: string): Promise<{ success: boolean; error?: string }> {
  if (typeof window === 'undefined') return { success: false, error: 'Window not defined' };

  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { success: false, error: 'Push notifications are not supported on this browser.' };
  }

  try {
    // 1. Request Notification Permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { success: false, error: 'Notification permission was denied. Please allow notifications to receive call alerts.' };
    }

    // 2. Register Service Worker
    const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    await navigator.serviceWorker.ready;

    // 3. Subscribe to Push Manager
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      const applicationServerKey = urlB64ToUint8Array(VAPID_PUBLIC_KEY);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });
    }

    // 4. Send subscription to backend
    const res = await fetch(`${BACKEND_URL}/api/host/push-subscription`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hostId,
        subscription: subscription.toJSON(),
        userAgent: navigator.userAgent,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error || 'Failed to save subscription on backend' };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[PushNotifications] Registration error:', err);
    return { success: false, error: err.message || 'Error subscribing to notifications' };
  }
}

/**
 * Screen WakeLock Helper: Keeps the mobile screen on while host is actively online.
 */
let wakeLockSentinel: any = null;

export async function requestScreenWakeLock(): Promise<boolean> {
  if (typeof window === 'undefined' || !('wakeLock' in navigator)) return false;

  try {
    wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
    wakeLockSentinel.addEventListener('release', () => {
      wakeLockSentinel = null;
    });
    return true;
  } catch (err) {
    console.warn('[WakeLock] Could not acquire screen wake lock:', err);
    return false;
  }
}

export function releaseScreenWakeLock() {
  if (wakeLockSentinel) {
    wakeLockSentinel.release().catch(() => {});
    wakeLockSentinel = null;
  }
}
