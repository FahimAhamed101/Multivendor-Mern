import { z } from "zod";
import { Request, Response, NextFunction } from "express";

const TopMeasurementsSchema = z.object({
  chest: z.number().optional(),
  shoulderWidth: z.number().optional(),
  armLength: z.number().optional(),
  inseam: z.number().optional(),
  neck: z.number().optional(),
  length: z.number().optional(),
  additionalNotes: z.string().optional(),
});

const TrouserMeasurementsSchema = z.object({
  waist: z.number().optional(),
  hips: z.number().optional(),
  inseam: z.number().optional(),
  outseam: z.number().optional(),
  thigh: z.number().optional(),
  knee: z.number().optional(),
  ankle: z.number().optional(),
  additionalNotes: z.string().optional(),
});

const ShortsMeasurementsSchema = z.object({
  waist: z.number().optional(),
  hips: z.number().optional(),
  inseam: z.number().optional(),
  outseam: z.number().optional(),
  thigh: z.number().optional(),
  additionalNotes: z.string().optional(),
});

export const TCDesignSchema = z
  .object({
    photo: z.string().min(1, "Photo is required"),
    measurementType: z.enum(["top", "trouser", "shorts"]),
    measurements: z.unknown(),
    additionalVendorNotes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const measurementSchemaMap = {
      top: TopMeasurementsSchema,
      trouser: TrouserMeasurementsSchema,
      shorts: ShortsMeasurementsSchema,
    };

    const result = measurementSchemaMap[data.measurementType].safeParse(
      data.measurements,
    );

    if (!result.success) {
      result.error.errors.forEach((err) => {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: err.message,
          path: ["measurements", ...err.path],
        });
      });
    }
  });

export type TCDesignInput = z.infer<typeof TCDesignSchema>;

export const validateTCDesign = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = TCDesignSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: result.error.flatten().fieldErrors,
    });
  }

  req.body = result.data;
  next();
};
