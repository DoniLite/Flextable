/* eslint-disable @typescript-eslint/naming-convention */
import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ApiError } from '@/lib/interfaces/errors';

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

interface ToastMessagesConfig {
  createSuccess: { titleKey: string; descriptionKey: string };
  updateSuccess: { titleKey: string; descriptionKey: string };
  deleteSuccess: { titleKey: string; descriptionKey: string };
  deleteMultipleSuccess: { titleKey: string; descriptionKey: string };
  error: { titleKey: string; defaultDescriptionKey?: string };
}

export function useEntityEditor<C, U, T extends EntityWithId>(
  store: CrudCompatibleStore<C, U, T>,
) {
  const { t } = useTranslation();

  // ----- state -----
  const [entityModel, setEntityModel] = useState<T | C | U>({
    ...store.defaultEntity,
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [editionMode, setEditionMode] = useState<EditionMode>(
    EditionMode.CREATE,
  );

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Array<Required<T>['id']>>([]);
  // keep reset callback in a ref to avoid re-renders when parent passes different function identities
  const currentTableResetSelectionRef = useRef<(() => void) | null>(null);

  // ----- toast messages (stable) -----
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
      error: {
        titleKey: 'common.toast.error.unexpected.title',
        defaultDescriptionKey: 'common.toast.error.unexpected.description',
      },
    };
  }, [store.translationPath]);

  // ----- dialog openers (stable) -----
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

  // ----- toasts (stable) -----
  const showToastError = useCallback(
    (error: unknown) => {
      if (error instanceof ApiError) {
        // Use ApiError description if available
        const description = error.description || (error as Error).message || '';
        toast.error(t(toastMessages.error.titleKey), {
          description: description ? t(description) : undefined,
        });
      } else {
        const descriptionKey =
          toastMessages.error.defaultDescriptionKey ??
          'common.toast.error.unexpected.description';
        toast.error(t(toastMessages.error.titleKey), {
          description: t(descriptionKey),
        });
      }
    },
    [t, toastMessages.error],
  );

  const showToastSuccess = useCallback(
    (successConfig: { titleKey: string; descriptionKey: string }) => {
      toast.success(t(successConfig.titleKey), {
        description: t(successConfig.descriptionKey),
      });
    },
    [t],
  );

  // ----- CRUD handlers (stable) -----
  const handleCreate = useCallback(
    async (createRequest: C) => {
      try {
        if (!store.create) {
          throw new Error('Create not implemented on store');
        }
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
        if (!store.update) {
          throw new Error('Update not implemented on store');
        }
        // entityModel.id could be undefined — but store.update expects Required<T>['id']
        const id = (entityModel as T).id as Required<T>['id'];
        await store.update(id, updateRequest);
        setOpenDialog(false);
        showToastSuccess(toastMessages.updateSuccess);
      } catch (err: unknown) {
        showToastError(err);
      }
    },
    [
      store,
      (entityModel as T).id,
      showToastError,
      showToastSuccess,
      toastMessages.updateSuccess,
    ],
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
        if (!store.deleteMultiple) {
          return;
        }
        await store.deleteMultiple(ids);
        showToastSuccess(toastMessages.deleteMultipleSuccess);
      } catch (err: unknown) {
        showToastError(err);
      } finally {
        setSelectedIds([]);
        // call reset callback if present
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
    [
      store,
      showToastError,
      showToastSuccess,
      toastMessages.deleteMultipleSuccess,
    ],
  );

  // ----- unified onSave (stable) -----
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

  // ----- modal texts (memoized) -----
  const modalTitle = useMemo(
    () => t(`${store.translationPath}.form.${editionMode}.title`),
    [editionMode, store.translationPath, t],
  );

  const modalDescription = useMemo(
    () => t(`${store.translationPath}.form.${editionMode}.description`),
    [editionMode, store.translationPath, t],
  );

  // ----- delete flow helpers (stable) -----
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
      // store reset callback in ref to avoid causing re-renders when parent provides unstable function identity
      currentTableResetSelectionRef.current = resetCallback ?? null;
      setSelectedIds(ids);
      setShowDeleteDialog(true);
    },
    [],
  );

  // ----- open/create/update setters should be returned as stable callbacks too -----
  const setOpenDialogCb = useCallback((v: boolean) => setOpenDialog(v), []);
  const setShowDeleteDialogCb = useCallback(
    (v: boolean) => setShowDeleteDialog(v),
    [],
  );

  // ----- returned API (memoized) -----
  return useMemo(
    () => ({
      entityModel,
      setEntityModel, // keep setter to edit from forms
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
