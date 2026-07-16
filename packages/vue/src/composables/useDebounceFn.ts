import { onUnmounted } from 'vue';

/** Debounces `fn` by `delay` ms, cancelling any pending call on unmount. */
export function useDebounceFn<TArgs extends Array<unknown>>(
  fn: (...args: TArgs) => void,
  delay = 300,
): (...args: TArgs) => void {
  let timer: ReturnType<typeof setTimeout> | undefined;

  onUnmounted(() => clearTimeout(timer));

  return (...args: TArgs) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
