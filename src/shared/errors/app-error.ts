export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: Record<string, unknown>;

  constructor(params: {
    message: string;
    statusCode?: number;
    code?: string;
    details?: Record<string, unknown>;
  }) {
    super(params.message);
    this.statusCode = params.statusCode ?? 400;
    this.code = params.code ?? 'BAD_REQUEST';
    this.details = params.details;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace?.(this, this.constructor);
  }
}


