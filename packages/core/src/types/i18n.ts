export type TranslateOptions = Record<string, unknown>;

/**
 * Injected translation function — decouples FlexTable from any specific
 * i18n library (react-i18next, vue-i18n, ...). Consumers pass their own `t`.
 */
export type TranslateFn = (key: string, options?: TranslateOptions) => string;
