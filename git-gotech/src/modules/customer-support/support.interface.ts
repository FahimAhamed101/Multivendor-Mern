import mongoose, { Document, Schema } from 'mongoose';
import { TRole } from '../../config/role';

export interface ISupportChat extends Document {
  userId: mongoose.Types.ObjectId;
  lastMessage?: string;
  lastMessageAt?: Date;
  status: 'active' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
}

export interface ISupportMessage extends Document {
  supportChatId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  senderRole: TRole;
  content: string;
  attachments?: string[];
  isRead: boolean;
  readAt?: Date;
  readerId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
