import { describe, expect, test } from 'bun:test';
import { ApiError } from '@flextable/core';
import {
  BackendExceptionCode,
  NestJsErrorCodeAdapter,
  UnexpectedErrorCode,
} from './nestJsErrorAdapter';

const adapter = new NestJsErrorCodeAdapter();

describe('NestJsErrorCodeAdapter', () => {
  test('resolves a recognized backend exception code as-is', () => {
    expect(adapter.resolve('ENTITY_NOT_FOUND', 404)).toBe(
      BackendExceptionCode.ENTITY_NOT_FOUND,
    );
  });

  test('falls back to statusCode-based resolution when the code is unrecognized', () => {
    expect(adapter.resolve(undefined, 401)).toBe(BackendExceptionCode.UNAUTHORIZED);
    expect(adapter.resolve(undefined, 404)).toBe(BackendExceptionCode.ENTITY_NOT_FOUND);
    expect(adapter.resolve(undefined, 400)).toBe(BackendExceptionCode.VALIDATION_ERROR);
    expect(adapter.resolve(undefined, 422)).toBe(BackendExceptionCode.VALIDATION_ERROR);
  });

  test('falls back to UNKNOWN_STORE_ERROR when nothing matches', () => {
    expect(adapter.resolve(undefined, undefined)).toBe(
      UnexpectedErrorCode.UNKNOWN_STORE_ERROR,
    );
    expect(adapter.resolve('SOME_UNKNOWN_CODE', 500)).toBe(
      UnexpectedErrorCode.UNKNOWN_STORE_ERROR,
    );
  });

  test('derives message/description keys under the common.toast.error namespace', () => {
    expect(adapter.messageKey(BackendExceptionCode.ENTITY_NOT_FOUND)).toBe(
      'common.toast.error.ENTITY_NOT_FOUND.title',
    );
    expect(adapter.descriptionKey(BackendExceptionCode.ENTITY_NOT_FOUND)).toBe(
      'common.toast.error.ENTITY_NOT_FOUND.description',
    );
  });

  test('plugs directly into ApiError.from()', () => {
    const error = ApiError.from({ statusCode: 404, code: 'ENTITY_NOT_FOUND' }, adapter);
    expect(error.code).toBe(BackendExceptionCode.ENTITY_NOT_FOUND);
    expect(error.messageKey).toBe('common.toast.error.ENTITY_NOT_FOUND.title');
  });
});
