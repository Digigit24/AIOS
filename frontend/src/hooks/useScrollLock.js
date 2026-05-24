import { useEffect } from 'react';

/**
 * Locks the body element scroll when a drawer, modal or backdrop is open.
 * Only triggers if the lock condition is true.
 * 
 * @param {boolean} lock - Condition to trigger body lock
 */
export function useScrollLock(lock) {
  useEffect(() => {
    if (!lock) return;

    // Cache original styles
    const originalStyle = window.getComputedStyle(document.body).overflow;
    
    // Apply lock
    document.body.style.overflow = 'hidden';

    // Restore on cleanup
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [lock]);
}
export default useScrollLock;
