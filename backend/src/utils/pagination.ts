export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Parsing query param page & limit secara aman dengan batas minimal/maksimal
 * ponytail: 1-line safe pagination parser
 */
export const getPaginationParams = (
  query: Record<string, any>,
  defaultLimit = 10,
  maxLimit = 100,
): PaginationParams => {
  const page = Math.max(1, Number(query?.page) || 1);
  const limit = Math.max(
    1,
    Math.min(maxLimit, Number(query?.limit) || defaultLimit),
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Format data list dan total record menjadi objek pagination terstandar
 */
export const createPaginatedMeta = (
  total: number,
  params: { page: number; limit: number },
): PaginationMeta => {
  const totalPages = Math.ceil(total / params.limit) || 1;

  return {
    total,
    page: params.page,
    limit: params.limit,
    totalPages,
    hasNextPage: params.page < totalPages,
    hasPrevPage: params.page > 1,
  };
};
