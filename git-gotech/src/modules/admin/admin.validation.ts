import { z } from "zod";

const createCategory = z.object({
    body:z.object({
        name:z.string(),
    })
})

const updateCategory = z.object({
    body:z.object({
        name:z.string().optional(),
    })
})

export const AdminValidation = {
    createCategory,
    updateCategory,
}
