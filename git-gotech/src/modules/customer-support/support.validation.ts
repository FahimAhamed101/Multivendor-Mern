import { z } from "zod";

const initSupportChatValidation = z.object({
    body: z.object({
        message: z.string().optional(),
        attachments: z.array(z.string()).optional(),
    }),
});

const sendSupportMessageValidation = z.object({
    body: z.object({
        message: z.string().optional(),
        attachments: z.array(z.string()).optional(),
    }),
});

export const SupportValidation = {
    initSupportChatValidation,
    sendSupportMessageValidation,
};