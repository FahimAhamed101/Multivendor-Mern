import { z } from "zod";

const createCustomOrderValidationSchema = z.object({
    productId: z.string().optional(),
    measurementType: z.enum(["top", "trouser", "shorts"]).optional(),
    measurements: z.object({
        chest: z.number().optional(),
        shoulderWidth: z.number().optional(),
        armLength: z.number().optional(),
        wrist: z.number().optional(),
        length: z.number().optional(),
        neck: z.number().optional(),
        waist: z.number().optional(),
        hips: z.number().optional(),
        inseam: z.number().optional(),
        outseam: z.number().optional(),
        thigh: z.number().optional(),
        calf: z.number().optional(),
        ankle: z.number().optional(),
        additionalNote: z.string().optional(),
    }).optional(),
    quantity: z.number().optional(),
    weight: z.object({
        unit: z.enum(["kg"]),
        amount: z.number(),
    }).optional(),
    deliveryInfo: z.object({
        name: z.string(),
        address: z.string(),
        country: z.string(),
        state: z.string(),
        zipcode: z.number(),
        email: z.string(),
        phone: z.number(),
        location: z.object({
            type: z.enum(["Point"]),
            coordinates: z.array(z.number()),
        }),
    }).optional(),
    pickUpInfo: z.object({
        name: z.string(),
        address: z.string(),
        country: z.string(),
        state: z.string(),
        zipcode: z.number(),
        email: z.string(),
        phone: z.number(),
        location: z.object({
            type: z.enum(["Point"]),
            coordinates: z.array(z.number()),
        }),
    }).optional(),
});

export const CustomOrdersValidation = {
    createCustomOrderValidationSchema,
};
