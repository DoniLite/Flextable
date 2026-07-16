import { afterEach, describe, expect, test } from 'bun:test';
import type { ErrorCodeAdapter, TranslateFn } from '@flextable/core';
import { act, cleanup, renderHook } from '@testing-library/react';
import type { CrudCompatibleStore } from './useEntityEditor';
import { EditionMode, useEntityEditor } from './useEntityEditor';

afterEach(() => {
  cleanup();
  document.body.replaceChildren();
});

interface Entity {
  id?: string;
  name: string;
}

const t: TranslateFn = (key) => key;
const errorAdapter: ErrorCodeAdapter<'UNKNOWN'> = {
  resolve: () => 'UNKNOWN',
  messageKey: (code) => `errors.${code}.title`,
  descriptionKey: (code) => `errors.${code}.description`,
};

function makeStore(overrides: Partial<CrudCompatibleStore<Entity, Entity, Entity>> = {}) {
  const calls: Array<string> = [];
  const store: CrudCompatibleStore<Entity, Entity, Entity> = {
    defaultEntity: { name: '' },
    translationPath: 'entities.widget',
    create: async () => {
      calls.push('create');
    },
    update: async () => {
      calls.push('update');
    },
    deleteOne: async () => {
      calls.push('deleteOne');
    },
    deleteMultiple: async () => {
      calls.push('deleteMultiple');
    },
    resetState: () => {
      calls.push('resetState');
    },
    ...overrides,
  };
  return { store, calls };
}

describe('useEntityEditor', () => {
  test('openCreateDialog resets the model to defaultEntity and opens in CREATE mode', () => {
    const { store } = makeStore();
    const { result } = renderHook(() => useEntityEditor(store, { t, errorAdapter }));

    act(() => result.current.openCreateDialog());

    expect(result.current.openDialog).toBe(true);
    expect(result.current.editionMode).toBe(EditionMode.CREATE);
    expect(result.current.entityModel).toEqual({ name: '' });
  });

  test('openUpdateDialog loads the given entity in UPDATE mode', () => {
    const { store } = makeStore();
    const { result } = renderHook(() => useEntityEditor(store, { t, errorAdapter }));

    act(() => result.current.openUpdateDialog({ id: 'e1', name: 'Widget' }));

    expect(result.current.editionMode).toBe(EditionMode.UPDATE);
    expect(result.current.entityModel).toEqual({ id: 'e1', name: 'Widget' });
  });

  test('onSave in CREATE mode calls store.create and closes the dialog on success', async () => {
    const { store, calls } = makeStore();
    const { result } = renderHook(() => useEntityEditor(store, { t, errorAdapter }));

    act(() => result.current.openCreateDialog());
    await act(async () => {
      await result.current.onSave({ name: 'New Widget' });
    });

    expect(calls).toContain('create');
    expect(result.current.openDialog).toBe(false);
  });

  test('onSave in UPDATE mode calls store.update with the current entity id', async () => {
    let updatedId: string | undefined;
    let updatedPayload: Entity | undefined;
    const { store } = makeStore({
      update: async (id, entity) => {
        updatedId = id;
        updatedPayload = entity;
      },
    });
    const { result } = renderHook(() => useEntityEditor(store, { t, errorAdapter }));

    act(() => result.current.openUpdateDialog({ id: 'e1', name: 'Widget' }));
    await act(async () => {
      await result.current.onSave({ id: 'e1', name: 'Widget Updated' });
    });

    expect(updatedId).toBe('e1');
    expect(updatedPayload).toEqual({ id: 'e1', name: 'Widget Updated' });
  });

  test('a failing save notifies the error callback via the ApiError messageKey/descriptionKey', async () => {
    const notified: Array<{ title: string; description?: string }> = [];
    const { store } = makeStore({
      create: async () => {
        throw new Error('create failed');
      },
    });
    const { result } = renderHook(() =>
      useEntityEditor(store, {
        t,
        errorAdapter,
        notify: {
          success: () => {},
          error: (title, options) =>
            notified.push({ title, description: options?.description }),
        },
      }),
    );

    act(() => result.current.openCreateDialog());
    await act(async () => {
      await result.current.onSave({ name: 'x' });
    });

    expect(notified).toEqual([
      { title: 'errors.UNKNOWN.title', description: 'errors.UNKNOWN.description' },
    ]);
  });

  test('onDeleteTrigger + confirmDelete calls deleteOne for a single selection', async () => {
    const { store, calls } = makeStore();
    const { result } = renderHook(() => useEntityEditor(store, { t, errorAdapter }));

    act(() => result.current.onDeleteTrigger(['e1']));
    expect(result.current.showDeleteDialog).toBe(true);

    await act(async () => {
      await result.current.confirmDelete();
    });

    expect(calls).toContain('deleteOne');
    expect(result.current.showDeleteDialog).toBe(false);
    expect(result.current.selectedIds).toEqual([]);
  });

  test('onDeleteTrigger + confirmDelete calls deleteMultiple and the reset callback for a multi-selection', async () => {
    const { store, calls } = makeStore();
    const { result } = renderHook(() => useEntityEditor(store, { t, errorAdapter }));

    let resetCalled = false;
    act(() =>
      result.current.onDeleteTrigger(['e1', 'e2'], () => {
        resetCalled = true;
      }),
    );

    await act(async () => {
      await result.current.confirmDelete();
    });

    expect(calls).toContain('deleteMultiple');
    expect(resetCalled).toBe(true);
  });

  test('modalTitle/modalDescription resolve from the store translationPath and edition mode', () => {
    const { store } = makeStore();
    const { result } = renderHook(() => useEntityEditor(store, { t, errorAdapter }));

    act(() => result.current.openCreateDialog());
    expect(result.current.modalTitle).toBe('entities.widget.form.create.title');

    act(() => result.current.openUpdateDialog({ id: 'e1', name: 'Widget' }));
    expect(result.current.modalTitle).toBe('entities.widget.form.update.title');
  });
});
