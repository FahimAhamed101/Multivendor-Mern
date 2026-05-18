import mongoose, { Schema } from 'mongoose';
import { IChat, IMessage } from './chat.interface';

// Chat Model
const chatSchema = new Schema<IChat>(
    {
        participants: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
        ],
        lastMessage: {
            type: String,
            maxlength: 500,
        },
        lastMessageAt: {
            type: Date,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        versionKey: false,
    },
);

// Index for efficiently finding a user's chats
chatSchema.index({ participants: 1, updatedAt: -1 });

export const ChatModel = mongoose.model<IChat>('Chat', chatSchema, 'chats');

// Message Model
const messageSchema = new Schema<IMessage>(
    {
        chatId: {
            type: Schema.Types.ObjectId,
            ref: 'Chat',
            required: true,
            index: true,
        },
        senderId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        content: {
            type: String,
            maxlength: 2000,
            default: "",
        },
        readAt: {
            type: Date,
        },
        documents: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        versionKey: false,
    },
);


// Index for pagination
messageSchema.index({ chatId: 1, createdAt: -1, _id: -1 });

// Virtual populate for sender
messageSchema.virtual('sender', {
    ref: 'User',
    localField: 'senderId',
    foreignField: '_id',
    justOne: true,
});

// Virtual populate for chat
messageSchema.virtual('chat', {
    ref: 'Chat',
    localField: 'chatId',
    foreignField: '_id',
    justOne: true,
});

export const MessageModel = mongoose.model<IMessage>('Message', messageSchema, 'messages');
