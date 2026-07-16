export interface NotifyOptions {
  description?: string;
}

/**
 * Injected toast/notification callback — decouples the CRUD hooks from any
 * specific toast library (the original app hardcoded `sonner`).
 */
export interface NotifyFn {
  success(title: string, options?: NotifyOptions): void;
  error(title: string, options?: NotifyOptions): void;
}

export const noopNotify: NotifyFn = {
  success: () => {},
  error: () => {},
};
