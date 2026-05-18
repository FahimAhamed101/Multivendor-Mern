import { z } from 'zod';

export const sendMessageBodySchema = z.object({
    // body: z.object({
    content: z
        .string()
        .max(2000, 'Message content must be at most 2000 characters')
        .optional()
        .default(""),
});

export const chatParamsSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Chat ID is required'),
    })
});

export const getMessagesQuerySchema = z.object({
    query: z.object({
        page: z.string().optional().default('1'),
        limit: z.string().optional().default('20'),
    })
});
