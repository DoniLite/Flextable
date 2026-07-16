import type { ErrorCodeAdapter } from '@flextable/core';

/** Backend validation/domain error codes, as emitted by a NestJS-shaped API. */
export enum BackendExceptionCode {
  ENTITY_NOT_FOUND = 'ENTITY_NOT_FOUND',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  INVALID_ARGUMENT = 'INVALID_ARGUMENT',
  METHOD_NOT_SUPPORTED = 'METHOD_NOT_SUPPORTED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  UNAUTHORIZED_EXCEPTION = 'UNAUTHORIZED_EXCEPTION',
}

/** Codes for errors that didn't originate from a recognized backend exception. */
export enum UnexpectedErrorCode {
  UNKNOWN_STORE_ERROR = 'UNKNOWN_STORE_ERROR',
  SESSION_EXPIRED_HANDLED = 'SESSION_EXPIRED_HANDLED',
}

export type NestJsErrorCode = BackendExceptionCode | UnexpectedErrorCode;

const KNOWN_BACKEND_CODES: ReadonlySet<string> = new Set(
  Object.values(BackendExceptionCode),
);

/**
 * Default opt-in `ErrorCodeAdapter` implementation matching the NestJS-shaped
 * backend the original app was built against. Not exported from
 * `@flextable/core` — it's a preset, not a core assumption. Consumers on a
 * different backend implement `ErrorCodeAdapter<TCode>` themselves instead.
 */
export class NestJsErrorCodeAdapter implements ErrorCodeAdapter<NestJsErrorCode> {
  resolve(rawCode: string | undefined, statusCode: number | undefined): NestJsErrorCode {
    if (rawCode && KNOWN_BACKEND_CODES.has(rawCode)) {
      return rawCode as BackendExceptionCode;
    }
    if (statusCode === 401) return BackendExceptionCode.UNAUTHORIZED;
    if (statusCode === 404) return BackendExceptionCode.ENTITY_NOT_FOUND;
    if (statusCode === 400 || statusCode === 422)
      return BackendExceptionCode.VALIDATION_ERROR;
    return UnexpectedErrorCode.UNKNOWN_STORE_ERROR;
  }

  messageKey(code: NestJsErrorCode): string {
    return `common.toast.error.${code}.title`;
  }

  descriptionKey(code: NestJsErrorCode): string {
    return `common.toast.error.${code}.description`;
  }
}
