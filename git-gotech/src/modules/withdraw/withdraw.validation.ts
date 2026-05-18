import { z } from "zod";

/** Mongo ObjectId validation */
export const objectIdSchema = z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

/** Money validation (industry standard: positive, max 2 decimals) */
export const moneySchema = z
    .number()
    .positive()
    .refine((v) => Number.isFinite(v), "Invalid amount")
    .refine(
        (v) => Math.round(v * 100) === v * 100,
        "Amount can have max 2 decimals"
    );

/** Safe trimmed string */
export const trimmedString = (min = 1, max = 120) =>
    z.string().trim().min(min).max(max);

/** Banking fields */
export const bankNameSchema = trimmedString(2, 80);
export const accountNameSchema = trimmedString(2, 120);

/**
 * Keep account number as string (can include leading zeros).
 * If you want strictly digits, keep regex.
 */
export const accountNumberSchema = z
    .string()
    .trim()
    .min(4)
    .max(34)
    .regex(/^[0-9A-Za-z\- ]+$/, "Invalid account number");

const countrySchema = z.string().trim().min(2).max(56).optional();

export const withdrawRequestSchema = z.object({
    body: z.object({
        amount: moneySchema,
        bankName: bankNameSchema,
        accountName: accountNameSchema,
        accountNumber: accountNumberSchema,
        country: countrySchema,
        bankCode: z.string().trim().min(3).max(20),
        moreInfo: z.string().trim().optional(),
    }),
});
