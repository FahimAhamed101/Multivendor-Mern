import { z } from "zod";

const createReturnOrderValidationSchema = z.object({
    body: z.object({
        clientReason: z.string().min(1, "Client reason is required"),
        isUsed: z.boolean(),
        price: z.object({
            unit: z.enum(["usd", "bdt", "rs"]),
            tip: z.number().min(0).optional(),
            deliveryCharge: z.number().min(0).optional(),
        }),
        deliveryInfo: z.object({
            name: z.string().min(1, "Name is required"),
            address: z.string().min(1, "Address is required"),
            country: z.string().min(1, "Country is required"),
            state: z.string().min(1, "State is required"),
            zipcode: z.number().min(1, "Valid zipcode is required"),
            email: z.string().email("Valid email is required"),
            phone: z.number().min(1, "Valid phone number is required"),
            location: z.object({
                type: z.enum(["Point"]),
                coordinates: z
                    .array(z.number())
                    .length(2, "Coordinates must be [longitude, latitude]"),
            }),
        }),
        pickUpInfo: z.object({
            name: z.string().min(1, "Name is required"),
            address: z.string().min(1, "Address is required"),
            country: z.string().min(1, "Country is required"),
            state: z.string().min(1, "State is required"),
            zipcode: z.number().min(1, "Valid zipcode is required"),
            email: z.string().email("Valid email is required"),
            phone: z.number().min(1, "Valid phone number is required"),
            location: z.object({
                type: z.enum(["Point"]),
                coordinates: z
                    .array(z.number())
                    .length(2, "Coordinates must be [longitude, latitude]"),
            }),
        }),
    })
});

export const ReturnOrderValidation = {
    createReturnOrderValidationSchema,
};
