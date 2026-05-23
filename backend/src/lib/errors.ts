export class AppError extends Error {
  public readonly statusCode: number;
  public readonly details: Array<{ field: string; message: string }> | undefined;

  constructor(statusCode: number, message: string, details?: Array<{ field: string; message: string }>) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Recurso não encontrado') {
    super(404, message);
  }
}

export class ValidationError extends AppError {
  constructor(details: Array<{ field: string; message: string }>, message = 'Dados inválidos') {
    super(422, message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Não autorizado') {
    super(401, message);
  }
}
