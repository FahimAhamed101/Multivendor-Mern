import { z } from "zod";

const productAddValidationSchema = z.object({
    body: z.object({
        product_name: z.string().min(3, "Product name must be at least 3 characters long"),
        product_category: z.string().min(3, "Product category must be at least 3 characters long"),
        product_description: z.string().min(3, "Product description must be at least 3 characters long"),
        product_price: z.number().min(1, "Product price must be at least 1"),
        product_stocks: z.array(z.object({
            size: z.string().min(1, "Stock name must be at least 1 characters long"),
            stock: z.number().min(1, "Stock quantity must be at least 1"),
        })),
        product_weight: z.object({
            unit: z.string().min(1, "Weight name must be at least 1 characters long"),
            amount: z.number().min(1, "Weight quantity must be at least 1"),
        }),
        discount:z.object({
            isValid: z.boolean().default(false).optional(),
            discount: z.number().min(1, "Discount quantity must be at least 1").optional(),
            startDate: z.string().optional(),
            endDate: z.string().optional(),
        }),
        isMixable: z.boolean().default(false).optional(),
        isCustom: z.boolean().default(false).optional(),
    })
})

const updateProductValidationSchema = z.object({
    body: z.object({
        product_name: z.string().min(3, "Product name must be at least 3 characters long").optional(),
        product_category: z.string().min(3, "Product category must be at least 3 characters long").optional(),
        product_description: z.string().min(3, "Product description must be at least 3 characters long").optional(),
        product_price: z.number().min(1, "Product price must be at least 1").optional(),
        product_stocks: z.array(z.object({
            size: z.string().min(1, "Stock name must be at least 1 characters long").optional(),
            stock: z.number().min(1, "Stock quantity must be at least 1").optional(),
        })).optional(),
        product_weight: z.object({
            unit: z.string().min(1, "Weight name must be at least 1 characters long").optional(),
            amount: z.number().min(1, "Weight quantity must be at least 1").optional(),
        }).optional(),
        discount:z.object({
            isValid: z.boolean().default(false).optional(),
            discount: z.number().min(1, "Discount quantity must be at least 1").optional(),
            startDate: z.string().optional(),
            endDate: z.string().optional(),
        }).optional(),
        isMixable: z.boolean().default(false).optional(),
        isCustom: z.boolean().default(false).optional(),
    })
})

export const ProductValidation = {
    productAddValidationSchema,
    updateProductValidationSchema
}