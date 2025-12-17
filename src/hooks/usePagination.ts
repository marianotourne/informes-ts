import { useState, useMemo } from "react";

interface UsePaginationProps<T> {
  data: T[];
  pageSize: number;
}

export function usePagination<T>({
  data,
  pageSize,
}: UsePaginationProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / pageSize);

  const paginatedData = useMemo(() => {
    return data.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  }, [data, currentPage, pageSize]);

  return {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedData,
  };
}
