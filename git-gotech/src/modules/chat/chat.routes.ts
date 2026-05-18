import { Router } from 'express';
import {
    getChats,
    getChatDetail,
    sendMessage,
    markChatAsRead,
    getChatDetailByUserId,
} from './chat.controller';
import {
    chatParamsSchema,
    getMessagesQuerySchema,
    sendMessageBodySchema,
} from './chat.validation';
import { validateRequest } from '../../middlewares/validateRequest';
import { guardRole } from '../../middlewares/roleGuard';
import { ERole } from '../../config/role';
import upload from '../../multer/multer';

const router = Router();

router.use(guardRole(ERole));

// Get all chats for the current user
router.get('/list', getChats);

// Send a new message
router.post(
    '/send/:id',
    upload.array('files'),
    validateRequest(sendMessageBodySchema),
    sendMessage
);

// Get chat details/messages
router.get(
    '/details/:id',
    validateRequest(chatParamsSchema.merge(getMessagesQuerySchema)),
    getChatDetail
);

// Mark chat as read
router.patch(
    '/:id/mark-read',
    validateRequest(chatParamsSchema),
    markChatAsRead
);

// Get Chat Message Using The Specific User ID
router.get(
    '/user/:userId/messages',
    getChatDetailByUserId
);

export default router;
