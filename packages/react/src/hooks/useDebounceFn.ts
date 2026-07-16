import { useCallback, useEffect, useRef } from 'react';

/** Debounces `fn` by `delay` ms, cancelling any pending call on unmount. */
export function useDebounceFn<TArgs extends Array<unknown>>(
  fn: (...args: TArgs) => void,
  delay = 300,
): (...args: TArgs) => void {
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const debounced = useCallback(
    (...args: TArgs) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => fn(...args), delay);
    },
    [fn, delay],
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  return debounced;
}
