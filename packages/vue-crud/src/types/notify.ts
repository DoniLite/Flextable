export interface NotifyOptions {
  description?: string;
}

/**
 * Injected toast/notification callback — decouples the CRUD composables
 * from any specific toast library (the original app hardcoded a Nuxt/Pinia
 * toast plugin via a store-shaped side effect).
 */
export interface NotifyFn {
  success(title: string, options?: NotifyOptions): void;
  error(title: string, options?: NotifyOptions): void;
}

export const noopNotify: NotifyFn = {
  success: () => {},
  error: () => {},
};
