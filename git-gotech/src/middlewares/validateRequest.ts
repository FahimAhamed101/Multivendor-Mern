import type { NextFunction, Request, Response } from "express";

import { z } from "zod";

export const validateRequest =
  (schema: z.ZodSchema) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body?.data) {
        req.body = JSON.parse(req.body.data);
      }

      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      next(error);
    }
  };
