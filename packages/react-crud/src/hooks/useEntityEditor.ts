import type { ErrorCodeAdapter, TranslateFn } from '@flextable/core';
import { ApiError } from '@flextable/core';
import { useCallback, useMemo, useRef, useState } from 'react';
import type { NotifyFn } from '../types/notify';
import { noopNotify } from '../types/notify';

export enum EditionMode {
  CREATE = 'create',
  UPDATE = 'update',
}

export interface EntityWithId {
  id?: string;
}

export interface CrudCompatibleStore<C, U, T extends EntityWithId> {
  defaultEntity: C | U;
  translationPath: string;
  create?: (entity: C) => Promise<void>;
  update?: (id: Required<T>['id'], entity: U) => Promise<void>;
  deleteOne: (id: Required<T>['id']) => Promise<void>;
  deleteMultiple?: (ids: Array<Required<T>['id']>) => Promise<void>;
  resetState: () => void;
}

export interface UseEntityEditorOptions<TCode extends string> {
  t: TranslateFn;
  errorAdapter: ErrorCodeAdapter<TCode>;
  notify?: NotifyFn;
}

interface ToastMessagesConfig {
  createSuccess: { titleKey: string; descriptionKey: string };
  updateSuccess: { titleKey: string; descriptionKey: string };
  deleteSuccess: { titleKey: string; descriptionKey: string };
  deleteMultipleSuccess: { titleKey: string; descriptionKey: string };
}

/**
 * Generalized from the original app's `useEntityEditor` — the hardcoded
 * `sonner` toast and app-owned `ApiError` are now injected (`notify`,
 * `errorAdapter`), and error toasts now go through `ApiError`'s own
 * `messageKey`/`descriptionKey` instead of always showing a generic
 * "unexpected error" title.
 */
export function useEntityEditor<C, U, T extends EntityWithId, TCode extends string>(
  store: CrudCompatibleStore<C, U, T>,
  options: UseEntityEditorOptions<TCode>,
) {
  const { t, errorAdapter, notify = noopNotify } = options;

  const [entityModel, setEntityModel] = useState<T | C | U>({ ...store.defaultEntity });
  const [openDialog, setOpenDialog] = useState(false);
  const [editionMode, setEditionMode] = useState<EditionMode>(EditionMode.CREATE);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Array<Required<T>['id']>>([]);
  const currentTableResetSelectionRef = useRef<(() => void) | null>(null);

  const toastMessages = useMemo<ToastMessagesConfig>(() => {
    const base = store.translationPath;
    return {
      createSuccess: {
        titleKey: `${base}.toast.create.success.title`,
        descriptionKey: `${base}.toast.create.success.description`,
      },
      updateSuccess: {
        titleKey: `${base}.toast.update.success.title`,
        descriptionKey: `${base}.toast.update.success.description`,
      },
      deleteSuccess: {
        titleKey: `${base}.toast.delete.success.title`,
        descriptionKey: `${base}.toast.delete.success.description`,
      },
      deleteMultipleSuccess: {
        titleKey: `${base}.toast.delete.success.titleMultiple`,
        descriptionKey: `${base}.toast.delete.success.descriptionMultiple`,
      },
    };
  }, [store.translationPath]);

  const openCreateDialog = useCallback(() => {
    store.resetState();
    setEditionMode(EditionMode.CREATE);
    setEntityModel({ ...store.defaultEntity });
    setOpenDialog(true);
  }, [store]);

  const openUpdateDialog = useCallback(
    (entityToEdit: T) => {
      store.resetState();
      setEditionMode(EditionMode.UPDATE);
      setEntityModel({ ...entityToEdit });
      setOpenDialog(true);
    },
    [store],
  );

  const closeDialog = useCallback(() => {
    store.resetState();
    setOpenDialog(false);
  }, [store]);

  const showToastError = useCallback(
    (error: unknown) => {
      const apiError = ApiError.from(error, errorAdapter);
      notify.error(t(apiError.messageKey), { description: t(apiError.descriptionKey) });
    },
    [t, notify, errorAdapter],
  );

  const showToastSuccess = useCallback(
    (successConfig: { titleKey: string; descriptionKey: string }) => {
      notify.success(t(successConfig.titleKey), {
        description: t(successConfig.descriptionKey),
      });
    },
    [t, notify],
  );

  const handleCreate = useCallback(
    async (createRequest: C) => {
      try {
        if (!store.create) throw new Error('Create not implemented on store');
        await store.create(createRequest);
        setOpenDialog(false);
        showToastSuccess(toastMessages.createSuccess);
      } catch (err: unknown) {
        showToastError(err);
      }
    },
    [store, showToastError, showToastSuccess, toastMessages.createSuccess],
  );

  const handleUpdate = useCallback(
    async (updateRequest: U) => {
      try {
        if (!store.update) throw new Error('Update not implemented on store');
        const id = (entityModel as T).id as Required<T>['id'];
        await store.update(id, updateRequest);
        setOpenDialog(false);
        showToastSuccess(toastMessages.updateSuccess);
      } catch (err: unknown) {
        showToastError(err);
      }
    },
    [store, entityModel, showToastError, showToastSuccess, toastMessages.updateSuccess],
  );

  const handleDelete = useCallback(
    async (id: Required<T>['id']) => {
      try {
        await store.deleteOne(id);
        showToastSuccess(toastMessages.deleteSuccess);
      } catch (err: unknown) {
        showToastError(err);
      }
    },
    [store, showToastError, showToastSuccess, toastMessages.deleteSuccess],
  );

  const handleDeleteMultiple = useCallback(
    async (ids: Array<Required<T>['id']>) => {
      try {
        if (!store.deleteMultiple) return;
        await store.deleteMultiple(ids);
        showToastSuccess(toastMessages.deleteMultipleSuccess);
      } catch (err: unknown) {
        showToastError(err);
      } finally {
        setSelectedIds([]);
        const cb = currentTableResetSelectionRef.current;
        if (cb) {
          try {
            cb();
          } catch {
            /* noop */
          }
          currentTableResetSelectionRef.current = null;
        }
      }
    },
    [store, showToastError, showToastSuccess, toastMessages.deleteMultipleSuccess],
  );

  const onSave = useCallback(
    async (formData: C | U) => {
      if (editionMode === EditionMode.CREATE && store.create) {
        await handleCreate(formData as C);
      } else if (editionMode === EditionMode.UPDATE && store.update) {
        await handleUpdate(formData as U);
      }
    },
    [editionMode, store.create, store.update, handleCreate, handleUpdate],
  );

  const modalTitle = useMemo(
    () => t(`${store.translationPath}.form.${editionMode}.title`),
    [editionMode, store.translationPath, t],
  );

  const modalDescription = useMemo(
    () => t(`${store.translationPath}.form.${editionMode}.description`),
    [editionMode, store.translationPath, t],
  );

  const confirmDelete = useCallback(async () => {
    try {
      if (selectedIds.length > 1) {
        await handleDeleteMultiple(selectedIds);
      } else {
        const id = selectedIds[0] ?? ('' as Required<T>['id']);
        await handleDelete(id);
      }
    } finally {
      setShowDeleteDialog(false);
      setSelectedIds([]);
      currentTableResetSelectionRef.current = null;
    }
  }, [selectedIds, handleDeleteMultiple, handleDelete]);

  const onDeleteTrigger = useCallback(
    (ids: Array<Required<T>['id']>, resetCallback?: (() => void) | null) => {
      currentTableResetSelectionRef.current = resetCallback ?? null;
      setSelectedIds(ids);
      setShowDeleteDialog(true);
    },
    [],
  );

  const setOpenDialogCb = useCallback((v: boolean) => setOpenDialog(v), []);
  const setShowDeleteDialogCb = useCallback((v: boolean) => setShowDeleteDialog(v), []);

  return useMemo(
    () => ({
      entityModel,
      setEntityModel,
      openDialog,
      onOpenDialog: setOpenDialogCb,
      editionMode,
      modalTitle,
      modalDescription,
      showDeleteDialog,
      onShowDeleteDialog: setShowDeleteDialogCb,
      selectedIds,
      openCreateDialog,
      openUpdateDialog,
      closeDialog,
      onSave,
      onDeleteTrigger,
      confirmDelete,
    }),
    [
      entityModel,
      setOpenDialogCb,
      openDialog,
      editionMode,
      modalTitle,
      modalDescription,
      showDeleteDialog,
      setShowDeleteDialogCb,
      selectedIds,
      openCreateDialog,
      openUpdateDialog,
      closeDialog,
      onSave,
      onDeleteTrigger,
      confirmDelete,
    ],
  );
}
