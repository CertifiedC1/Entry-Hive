import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

const TIMEOUT_DURATION = 20 * 60 * 1000; // 20 minutes in milliseconds
const WARNING_BEFORE = 2 * 60 * 1000; // 2 minutes before timeout

export const useSessionTimeout = () => {
  const { user, signOut } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
      warningRef.current = null;
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    clearTimers();
    toast.info('Your session has expired. Please sign in again.');
    await signOut();
  }, [signOut, clearTimers]);

  const resetTimeout = useCallback(() => {
    lastActivityRef.current = Date.now();
    clearTimers();

    if (user) {
      // Warning timer (18 minutes)
      warningRef.current = setTimeout(() => {
        toast.warning('Your session will expire in 2 minutes due to inactivity.', {
          duration: 10000,
        });
      }, TIMEOUT_DURATION - WARNING_BEFORE);

      // Logout timer (20 minutes)
      timeoutRef.current = setTimeout(async () => {
        const timeSinceLastActivity = Date.now() - lastActivityRef.current;
        if (timeSinceLastActivity >= TIMEOUT_DURATION) {
          await handleSignOut();
        }
      }, TIMEOUT_DURATION);
    }
  }, [user, handleSignOut, clearTimers]);

  useEffect(() => {
    if (!user) {
      clearTimers();
      return;
    }

    // Set up activity listeners
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      resetTimeout();
    };

    events.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Initial timeout setup
    resetTimeout();

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
      clearTimers();
    };
  }, [user, resetTimeout, clearTimers]);

  return { resetTimeout };
};