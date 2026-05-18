import { z } from "zod";

const addEventMemberValidation = z.object({
    body: z.object({
        event: z.string(),
        memberDetails: z.object({
            name: z.string(),
            email: z.string().email(),
        }),
    }),
})

export const EventValidation = {
    addEventMemberValidation
}