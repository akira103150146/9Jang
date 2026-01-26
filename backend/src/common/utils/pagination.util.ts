export interface PaginatedResponse<T> {
  count: number;
  next: number | null;
  previous: number | null;
  results: T[];
}

export function createPaginatedResponse<T>(
  results: T[],
  count: number,
  page: number,
  pageSize: number,
): PaginatedResponse<T> {
  return {
    count,
    next: (page - 1) * pageSize + results.length < count ? page + 1 : null,
    previous: page > 1 ? page - 1 : null,
    results,
  };
}
