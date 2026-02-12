/**
 * Capture current state before an optimistic update and return a rollback function.
 * Call BEFORE applying the optimistic change.
 *
 * @example
 * const rollback = captureForRollback(() => [...variants], setVariants);
 * setVariants(updatedVariants); // Apply optimistic change
 * // In Inertia router onError callback:
 * rollback();
 */
export function captureForRollback<T>(
    getState: () => T,
    restore: (state: T) => void,
): () => void {
    const snapshot = getState();

    return () => {
        if (import.meta.env.DEV) {
            console.log('[Optimistic] Rolling back to previous state');
        }
        restore(snapshot);
    };
}
