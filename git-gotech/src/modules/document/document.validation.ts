import { z } from "zod";

const addOrUpdateDocumentValidation = z.object({
  body: z.object({
    national_id: z.object({
      number: z.coerce.number().optional(),
    }).optional(),
    driving_license: z.object({
      number: z.coerce.number().optional(),
    }).optional(),
    vehicle_license: z.object({
      number: z.coerce.number().optional(),
      brand: z.string().optional(),
      model: z.string().optional(),
    }).optional(),
    insurance: z.object({
      policy_number: z.coerce.number().optional(),
      company_name: z.string().optional(),
    }).optional(),
  }),
});

export const DocumentValidation = {
  addOrUpdateDocumentValidation,
};
