import { useMemo, useState } from "react";

export const DEFAULT_PAGE_SIZE = 10;

export function usePagination<T>(items: T[], pageSize = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  // Si se eliminan ítems o cambia el filtro, la página no puede quedar fuera de rango
  const currentPage = Math.min(page, totalPages);

  const pageItems = useMemo(
    () => items.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [items, currentPage, pageSize],
  );

  return {
    page: currentPage,
    setPage,
    totalPages,
    pageItems,
    pageSize,
    totalItems: items.length,
  };
}
