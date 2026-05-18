import { ChatModel, MessageModel } from './chat.model';
import { io, connectedUsers } from '../../utils/socket';
import mongoose from 'mongoose';
import AppError from '../../helpers/AppError';
import httpStatus from 'http-status';
import { AggregateQueryBuilder } from '../../utils/AggregateQueryBuilder';

class ChatService {
    /**
     * Get user's chats (Sorted by most recent activity)
     */
    async getChats(userId: string, query: Record<string, any>): Promise<any> {
        const basePipeline = [
            {
                $match: {
                    participants: new mongoose.Types.ObjectId(userId),
                    isActive: true,
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'participants',
                    foreignField: '_id',
                    as: 'participantDetails',
                },
            },
            {
                $project: {
                    _id: 1,
                    participants: {
                        $map: {
                            input: '$participantDetails',
                            as: 'p',
                            in: {
                                _id: '$$p._id',
                                name: '$$p.name',
                                image: '$$p.image',
                                email: '$$p.email',
                                role: '$$p.role',
                            },
                        },
                    },
                    isActive: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    lastMessage: 1,
                    lastMessageAt: 1,
                },
            },
        ];

        const queryBuilder = new AggregateQueryBuilder(ChatModel, basePipeline, query)
            .filter()
            .search(['participants.name', "participants.email"])
            .sort('-updatedAt')
            .paginate();

        return queryBuilder.buildWithMeta();
    }

    /**
     * Get chat detail and messages (paginated)
     */
    async getChatDetail(
        chatId: string,
        userId: string,
        page = 1,
        limit = 20,
    ): Promise<any> {
        const chat = await ChatModel.findById(chatId)
            .populate({ path: 'participants', select: 'name image isOnline' })
            .lean();

        if (!chat) {
            throw new AppError(httpStatus.NOT_FOUND, 'Chat not found');
        }

        const isParticipant = chat.participants.some(p => p._id.toString() === userId);
        if (!isParticipant) {
            throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized to view this chat');
        }

        const messages = await MessageModel.find({ chatId: chat._id })
            .populate({ path: 'senderId', select: 'name image' })
            .sort({ createdAt: 1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        // Mark unread messages as read
        const unreadMessages = messages.filter(
            (msg) => msg.senderId._id.toString() !== userId && !msg.readAt,
        );

        if (unreadMessages.length > 0) {
            await MessageModel.updateMany(
                { _id: { $in: unreadMessages.map((msg) => msg._id) } },
                { readAt: new Date() },
            );
        }

        const totalCount = await MessageModel.countDocuments({ chatId: chat._id });
        const totalPages = Math.ceil(totalCount / limit);

        return {
            chat,
            messages,
            meta: {
                pagination: {
                    currentPage: page,
                    limit,
                    totalCount,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1,
                },
            },
        };
    }

    /**
     * Send message (Finds or Creates Chat)
     */
    async sendMessage(
        senderId: string,
        receiverId: string,
        content: string,
        documents?: string[],
    ): Promise<any> {
        if (senderId === receiverId) {
            throw new AppError(httpStatus.BAD_REQUEST, 'You cannot send a message to yourself');
        }

        // Find existing chat between the two users
        let chat = await ChatModel.findOne({
            participants: {
                $all: [new mongoose.Types.ObjectId(senderId), new mongoose.Types.ObjectId(receiverId)],
            },
        });

        if (!chat) {
            chat = await ChatModel.create({
                participants: [new mongoose.Types.ObjectId(senderId), new mongoose.Types.ObjectId(receiverId)],
                isActive: true,
            });
        }

        // Create message
        const message = await MessageModel.create({
            chatId: chat._id,
            senderId: new mongoose.Types.ObjectId(senderId),
            content: content.trim(),
            documents: documents ?? []
        });

        // Update chat's last message
        await ChatModel.updateOne(
            { _id: chat._id },
            {
                lastMessage: content?.trim() || (documents?.length ? "📎 Attachment" : ""),
                lastMessageAt: new Date(),
            },
        );

        const updatedMessage = await MessageModel.findById(message._id).populate({ path: 'senderId', select: 'name image email' });

        // Emit to receiver
        const receiverSocket = connectedUsers[receiverId];
        if (receiverSocket && io) {
            io.to(receiverSocket.socketID).emit("receiveMessage", updatedMessage);
        }

        // Emit to sender
        const senderSocket = connectedUsers[senderId];
        if (senderSocket && io) {
            io.to(senderSocket.socketID).emit("sendMessage", updatedMessage);
        }

        return updatedMessage;
    }

    /**
     * Mark chat as read
     */
    async markChatAsRead(
        chatId: string,
        userId: string,
    ): Promise<any> {
        const chat = await ChatModel.findById(chatId);

        if (!chat) {
            throw new AppError(httpStatus.NOT_FOUND, 'Chat not found');
        }

        const isParticipant = chat.participants.some(p => p.toString() === userId);
        if (!isParticipant) {
            throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized to mark this chat as read');
        }

        await MessageModel.updateMany(
            {
                chatId: chat._id,
                senderId: { $ne: new mongoose.Types.ObjectId(userId) },
                readAt: { $exists: false },
            },
            { readAt: new Date() },
        );

        return { success: true };
    }

    async getChatDetailByUserId(
        userId: string,
        otherUserId: string,
        page = 1,
        limit = 20,
    ): Promise<any> {
        // Find or create chat between the two users
        let chat = await ChatModel.findOne({
            participants: {
                $all: [new mongoose.Types.ObjectId(userId), new mongoose.Types.ObjectId(otherUserId)],
            },
        }).populate({ path: 'participants', select: 'name image' }).lean();

        if (!chat) {
            return {
                chat: {},
                messages: [],
                meta: {
                    pagination: {
                        currentPage: page,
                        limit,
                        totalCount: 0,
                        totalPages: 0,
                        hasNextPage: false,
                        hasPrevPage: false,
                    },
                },
            }
        }

        // Fetch messages with pagination
        const messages = await MessageModel.find({ chatId: chat._id })
            .populate({ path: 'senderId', select: 'name image email' })
            .sort({ createdAt: 1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        // Mark unread messages as read
        const unreadMessages = messages.filter(
            (msg) => msg.senderId._id.toString() !== userId && !msg.readAt,
        );

        if (unreadMessages.length > 0) {
            await MessageModel.updateMany(
                { _id: { $in: unreadMessages.map((msg) => msg._id) } },
                { readAt: new Date() },
            );
        }

        const totalCount = await MessageModel.countDocuments({ chatId: chat._id });
        const totalPages = Math.ceil(totalCount / limit);

        return {
            chat,
            messages,
            meta: {
                pagination: {
                    currentPage: page,
                    limit,
                    totalCount,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1,
                },
            },
        };
    }
}

export const chatService = new ChatService();
