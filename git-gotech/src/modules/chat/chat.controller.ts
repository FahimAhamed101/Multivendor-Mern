import { Request, Response } from 'express';
import { chatService } from './chat.service';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import {
    sendMessageBodySchema,
    chatParamsSchema,
    getMessagesQuerySchema,
} from './chat.validation';

// Get current user ID from request
const getCurrentUserId = (req: Request): string => {
    return (req as any).user?.id;
};

// Get current user's chats
export const getChats = catchAsync(async (req: Request, res: Response) => {
    const userId = getCurrentUserId(req);
    const result = await chatService.getChats(userId, req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Chats retrieved successfully',
        data: result,
    });
});

// Get chat detail and messages
export const getChatDetail = catchAsync(async (req: Request, res: Response) => {
    const userId = getCurrentUserId(req);
    // Because validateRequest might put params/query back differently depending on implementation,
    // assuming it passes them through to req.
    const chatId = req.params.id;
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '20', 10);

    const result = await chatService.getChatDetail(chatId, userId, page, limit);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Chat detail retrieved successfully',
        data: result,
    });
});

// Send message
export const sendMessage = catchAsync(async (req: Request, res: Response) => {
    const senderId = getCurrentUserId(req);
    const receiverId = req.params.id;
    const { content } = req.body;

    let documents: string[] = [];
    if (req.files && Array.isArray(req.files)) {
        documents = req.files.map((file) => file.filename);
    }

    const message = await chatService.sendMessage(senderId, receiverId, JSON.parse(content) || "", documents);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Message sent successfully',
        data: message,
    });
});

// Mark chat as read
export const markChatAsRead = catchAsync(async (req: Request, res: Response) => {
    const userId = getCurrentUserId(req);
    const chatId = req.params.id;

    const result = await chatService.markChatAsRead(chatId, userId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Chat marked as read',
        data: result,
    });
});

// Get chat detail and messages using userId instead of chatId
export const getChatDetailByUserId = catchAsync(async (req: Request, res: Response) => {
    const userId = getCurrentUserId(req);
    const otherUserId = req.params.userId;
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '20', 10);

    const result = await chatService.getChatDetailByUserId(userId, otherUserId, page, limit);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Chat detail retrieved successfully',
        data: result,
    });
});

