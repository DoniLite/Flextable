import type { PropsWithChildren } from 'react';
import { createContext, useContext, useState } from 'react';

interface TablePaginationContextValue {
  loading: boolean;
  setLoading: (state: boolean) => void;
}

const paginationContext = createContext<TablePaginationContextValue | undefined>(
  undefined,
);

export function useTablePagination(): TablePaginationContextValue {
  const context = useContext(paginationContext);
  if (!context) {
    throw new Error('useTablePagination must be used within a TablePaginationProvider');
  }
  return context;
}

export function TablePaginationProvider({ children }: PropsWithChildren) {
  const [loading, setLoading] = useState(false);
  return (
    <paginationContext.Provider value={{ loading, setLoading }}>
      {children}
    </paginationContext.Provider>
  );
}
