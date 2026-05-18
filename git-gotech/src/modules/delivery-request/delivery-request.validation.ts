import { z } from "zod";
import { ECurrency, EStatus } from "./delivery-request.interface";

const createDeliveryRequestSchema = z.object({
  body: z.object({
    category: z.string().min(1, "Category is required"),
    numberOfItems: z.number().refine((val) => val >= 1, {
      message: "Number of items must be at least 1",
    }),
    weight: z.object({
      unit: z.enum(["kg", "mg", "gm", "pound", "ounce"]),
      value: z.number().refine((val) => val > 0, {
        message: "Weight value must be greater than 0",
      }),
    }),
    price: z.object({
      currency: z.nativeEnum(ECurrency),
      tip: z.number().refine((val) => val >= 0, {
        message: "Tip must be greater than or equal to 0",
      }),
      deliveryFee: z.number().refine((val) => val >= 0, {
        message: "Delivery fee must be greater than or equal to 0",
      }),
    }),
    pickupLocation: z.object({
      name: z.string().min(1, "Pickup name is required"),
      phone: z.string().min(1, "Pickup phone is required"),
      location: z.string().min(1, "Pickup location is required"),
      email: z.string().email("Invalid pickup email address"),
      coordinates: z
        .array(z.string().transform((val) => Number(val)))
        .or(z.array(z.number()))
        .refine((val) => val.length === 2, "Coordinates must contain exactly [longitude, latitude]"),
      country: z.string().min(1, "Pickup country is required"),
      state: z.string().min(1, "Pickup state is required"),
      zipCode: z.string().min(1, "Pickup zip code is required"),
    }),
    deliveryAddress: z.object({
      name: z.string().min(1, "Delivery name is required"),
      phone: z.string().min(1, "Delivery phone is required"),
      location: z.string().min(1, "Delivery location is required"),
      coordinates: z
        .array(z.string().transform((val) => Number(val)))
        .or(z.array(z.number()))
        .refine((val) => val.length === 2, "Coordinates must contain exactly [longitude, latitude]"),
      email: z.string().email("Invalid delivery email address"),
      country: z.string().min(1, "Delivery country is required"),
      state: z.string().min(1, "Delivery state is required"),
      zipCode: z.string().min(1, "Delivery zip code is required"),
    }),
  }),
});

const updateDeliveryRequestStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(EStatus, { required_error: "Status is required for updating." }),
    rejectedReason: z.string().optional(),
  }),
});

export const DeliveryRequestValidation = {
  createDeliveryRequestSchema,
  updateDeliveryRequestStatusSchema,
};
