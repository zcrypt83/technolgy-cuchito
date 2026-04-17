/**
 * Helpers para paginación consistente en toda la API
 */

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Obtiene y valida los parámetros de paginación desde query params
 * @param query - Query params del request
 * @returns Parámetros de paginación validados
 */
export const getPaginationParams = (query: any): Required<PaginationParams> => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  return { page, limit };
};

/**
 * Construye una respuesta paginada consistente
 * @param data - Array de datos
 * @param total - Total de registros
 * @param page - Página actual
 * @param limit - Límite por página
 * @returns Respuesta paginada
 */
export const buildPaginatedResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> => {
  const totalPages = Math.ceil(total / limit);
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
};

/**
 * Calcula offset para queries SQL
 * @param page - Página actual
 * @param limit - Límite por página
 * @returns Offset para SQL
 */
export const getOffset = (page: number, limit: number): number => {
  return (page - 1) * limit;
};

/**
 * Parámetros completos para Sequelize
 */
export interface SequelizePaginationParams {
  offset: number;
  limit: number;
}

/**
 * Obtiene parámetros de paginación para Sequelize
 * @param query - Query params del request
 * @returns Parámetros para Sequelize (offset y limit)
 */
export const getSequelizePaginationParams = (query: any): SequelizePaginationParams => {
  const { page, limit } = getPaginationParams(query);
  return {
    offset: getOffset(page, limit),
    limit
  };
};
