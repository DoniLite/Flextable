import type { ApiErrorResponseShape, ErrorCodeAdapter } from '../types/errors';

/**
 * Backend-agnostic API error. All backend-shape knowledge (what codes exist,
 * which i18n keys they map to) is delegated to an injected `ErrorCodeAdapter`
 * instead of being hardcoded — see `@flextable/react-crud`/`@flextable/vue-crud`
 * for a ready-made NestJS-shaped adapter.
 */
export class ApiError<TCode extends string = string> extends Error {
  readonly statusCode: number;
  readonly code: TCode;
  readonly description: string | undefined;
  readonly details: unknown;
  #adapter: ErrorCodeAdapter<TCode>;

  constructor(response: ApiErrorResponseShape, adapter: ErrorCodeAdapter<TCode>) {
    const code = adapter.resolve(response.code, response.statusCode);
    super(response.message ?? code);
    this.name = 'ApiError';
    this.statusCode = response.statusCode ?? 500;
    this.code = code;
    this.description = response.description;
    this.details = response.details;
    this.#adapter = adapter;
  }

  get messageKey(): string {
    return this.#adapter.messageKey(this.code);
  }

  get descriptionKey(): string {
    return this.#adapter.descriptionKey(this.code);
  }

  is(code: TCode): boolean {
    return this.code === code;
  }

  /**
   * Normalizes any thrown value into an `ApiError`. Reads `statusCode`/
   * `code`/`message`/`description`/`details` off any object-shaped error —
   * covers both real `Error` subclasses with extra fields bolted on and
   * plain rejected objects (`throw { statusCode, code, message }`), which
   * is how many `fetch`/HTTP clients surface API failures.
   */
  static from<TCode extends string>(
    error: unknown,
    adapter: ErrorCodeAdapter<TCode>,
  ): ApiError<TCode> {
    if (error instanceof ApiError) {
      return error as ApiError<TCode>;
    }
    return new ApiError<TCode>(extractResponseShape(error), adapter);
  }
}

function extractResponseShape(error: unknown): ApiErrorResponseShape {
  if (error && typeof error === 'object') {
    const candidate = error as Record<string, unknown>;
    return {
      statusCode: typeof candidate.statusCode === 'number' ? candidate.statusCode : 500,
      code: typeof candidate.code === 'string' ? candidate.code : undefined,
      message: typeof candidate.message === 'string' ? candidate.message : undefined,
      description:
        typeof candidate.description === 'string' ? candidate.description : undefined,
      details: candidate.details,
    };
  }
  return { statusCode: 500, message: 'An unknown error occurred.' };
}
