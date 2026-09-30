export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface ApiErrorBody {
  statusCode: number;
  message: string | string[];
  path: string;
  timestamp: string;
}

export class ApiError extends Error {
  statusCode: number;
  path: string;
  messages: string[];

  constructor(body: ApiErrorBody) {
    const messages = Array.isArray(body.message) ? body.message : [body.message];
    super(messages.join(" "));
    this.name = "ApiError";
    this.statusCode = body.statusCode;
    this.path = body.path;
    this.messages = messages;
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.messages.join(" ");
  if (error instanceof Error) return error.message;
  return "Ocurrió un error inesperado";
}
