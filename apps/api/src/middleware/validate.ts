import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        const firstIssue = err.issues[0];
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: firstIssue ? firstIssue.message : 'Invalid request payload',
            details: err.flatten().fieldErrors,
          },
        });
        return;
      }
      next(err);
    }
  };
}
