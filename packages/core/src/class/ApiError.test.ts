import { describe, expect, test } from 'bun:test';
import type { ErrorCodeAdapter } from '../types/errors';
import { ApiError } from './ApiError';

type TestCode = 'NOT_FOUND' | 'UNKNOWN';

const adapter: ErrorCodeAdapter<TestCode> = {
  resolve: (rawCode) => (rawCode === 'ENTITY_NOT_FOUND' ? 'NOT_FOUND' : 'UNKNOWN'),
  messageKey: (code) => `errors.${code}.title`,
  descriptionKey: (code) => `errors.${code}.description`,
};

describe('ApiError', () => {
  test('resolves the code and status via the adapter', () => {
    const error = new ApiError({ statusCode: 404, code: 'ENTITY_NOT_FOUND' }, adapter);
    expect(error.code).toBe('NOT_FOUND');
    expect(error.statusCode).toBe(404);
    expect(error.name).toBe('ApiError');
  });

  test('defaults statusCode to 500 when absent', () => {
    const error = new ApiError({}, adapter);
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe('UNKNOWN');
  });

  test('uses the response message, falling back to the resolved code', () => {
    expect(new ApiError({ message: 'boom' }, adapter).message).toBe('boom');
    expect(new ApiError({}, adapter).message).toBe('UNKNOWN');
  });

  test('exposes description/details from the response', () => {
    const error = new ApiError({ description: 'oops', details: { field: 'x' } }, adapter);
    expect(error.description).toBe('oops');
    expect(error.details).toEqual({ field: 'x' });
  });

  test('derives message/description i18n keys through the adapter', () => {
    const error = new ApiError({ code: 'ENTITY_NOT_FOUND' }, adapter);
    expect(error.messageKey).toBe('errors.NOT_FOUND.title');
    expect(error.descriptionKey).toBe('errors.NOT_FOUND.description');
  });

  test('is() checks the resolved code', () => {
    const error = new ApiError({ code: 'ENTITY_NOT_FOUND' }, adapter);
    expect(error.is('NOT_FOUND')).toBe(true);
    expect(error.is('UNKNOWN')).toBe(false);
  });

  describe('from()', () => {
    test('passes an existing ApiError through unchanged', () => {
      const original = new ApiError({ code: 'ENTITY_NOT_FOUND' }, adapter);
      expect(ApiError.from(original, adapter)).toBe(original);
    });

    test('wraps a native Error using its message', () => {
      const wrapped = ApiError.from(new Error('native failure'), adapter);
      expect(wrapped).toBeInstanceOf(ApiError);
      expect(wrapped.message).toBe('native failure');
      expect(wrapped.statusCode).toBe(500);
    });

    test('wraps a non-Error thrown value with a generic message', () => {
      const wrapped = ApiError.from('a plain string was thrown', adapter);
      expect(wrapped.message).toBe('An unknown error occurred.');
    });

    test('reads statusCode/code/message/description/details off a plain rejected object', () => {
      const wrapped = ApiError.from(
        {
          statusCode: 404,
          code: 'ENTITY_NOT_FOUND',
          message: 'not found',
          description: 'no such widget',
          details: { id: 'w1' },
        },
        adapter,
      );
      expect(wrapped.statusCode).toBe(404);
      expect(wrapped.code).toBe('NOT_FOUND');
      expect(wrapped.message).toBe('not found');
      expect(wrapped.description).toBe('no such widget');
      expect(wrapped.details).toEqual({ id: 'w1' });
    });

    test('ignores non-string/non-number fields on a malformed rejected object', () => {
      const wrapped = ApiError.from(
        { statusCode: '404', code: 42, message: null },
        adapter,
      );
      expect(wrapped.statusCode).toBe(500);
      expect(wrapped.code).toBe('UNKNOWN');
      expect(wrapped.message).toBe('UNKNOWN');
    });
  });
});
