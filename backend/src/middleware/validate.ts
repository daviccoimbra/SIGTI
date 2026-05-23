import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { ValidationError } from '../lib/errors.js';

type ValidateTarget = 'body' | 'query';

export function validate(schema: ZodSchema, target: ValidateTarget = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const data = target === 'body' ? req.body : req.query;
    const result = schema.safeParse(data);
    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      next(new ValidationError(details));
      return;
    }
    if (target === 'body') {
      req.body = result.data;
    }
    next();
  };
}
