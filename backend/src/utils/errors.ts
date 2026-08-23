export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}

export function notFound(message = "Resource not found") {
  return new AppError(message, 404);
}

export function unauthorized(message = "Authentication required") {
  return new AppError(message, 401);
}

export function forbidden(message = "You are not authorized to perform this action") {
  return new AppError(message, 403);
}
