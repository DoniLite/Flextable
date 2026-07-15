import { createContext, useContext, useState } from 'react';
import type { PropsWithChildren } from 'react';

interface TablePaginationType {
  loading: boolean;
  setLoading: (state: boolean) => void;
}

const paginationContext = createContext<TablePaginationType | undefined>(
  undefined,
);

export function useTablePagination() {
  const context = useContext(paginationContext);

  if (!context) {
    throw new Error(
      'useTablePagination must be used within a TablePaginationProvider',
    );
  }

  return context;
}

export function TablePaginationProvider({ children }: PropsWithChildren) {
  const [loading, setLoading] = useState<boolean>(false);

  const value: TablePaginationType = {
    loading,
    setLoading,
  };

  return (
    <paginationContext.Provider value={value}>
      {children}
    </paginationContext.Provider>
  );
}
