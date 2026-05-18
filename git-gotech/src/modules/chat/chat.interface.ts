import { Types, Document } from 'mongoose';

export interface IChat extends Document {
    participants: Types.ObjectId[];
    lastMessage?: string;
    lastMessageAt?: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IMessage extends Document {
    chatId: Types.ObjectId;
    senderId: Types.ObjectId;
    content: string;
    readAt?: Date;
    documents: string[];
    createdAt: Date;
    updatedAt: Date;
}
