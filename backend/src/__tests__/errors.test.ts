import { describe, it, expect } from 'vitest';
import { AppError, NotFoundError, ValidationError, UnauthorizedError } from '../lib/errors.js';

describe('AppError', () => {
  it('should set statusCode, message, and details', () => {
    const err = new AppError(418, 'teapot', [{ field: 'brew', message: 'I am a teapot' }]);
    expect(err.statusCode).toBe(418);
    expect(err.message).toBe('teapot');
    expect(err.details).toEqual([{ field: 'brew', message: 'I am a teapot' }]);
    expect(err.name).toBe('AppError');
  });

  it('should allow undefined details', () => {
    const err = new AppError(500, 'error');
    expect(err.details).toBeUndefined();
  });
});

describe('NotFoundError', () => {
  it('should use 404 status', () => {
    const err = new NotFoundError();
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Recurso não encontrado');
    expect(err.name).toBe('NotFoundError');
  });

  it('should accept custom message', () => {
    const err = new NotFoundError('Ticket não encontrado');
    expect(err.message).toBe('Ticket não encontrado');
  });
});

describe('ValidationError', () => {
  it('should use 422 status with details', () => {
    const details = [{ field: 'name', message: 'Nome é obrigatório' }];
    const err = new ValidationError(details);
    expect(err.statusCode).toBe(422);
    expect(err.message).toBe('Dados inválidos');
    expect(err.details).toEqual(details);
  });
});

describe('UnauthorizedError', () => {
  it('should use 401 status', () => {
    const err = new UnauthorizedError();
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe('Não autorizado');
    expect(err.name).toBe('UnauthorizedError');
  });
});
