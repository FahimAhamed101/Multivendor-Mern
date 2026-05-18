import mongoose, { Schema } from 'mongoose';
import { ISupportChat, ISupportMessage } from './support.interface';
import { ERole } from '../../config/role';

const supportChatSchema = new Schema<ISupportChat>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    lastMessage: {
      type: String,
      maxlength: 500,
    },
    lastMessageAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['active', 'resolved'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const SupportChatModel = mongoose.model<ISupportChat>(
  'SupportChat',
  supportChatSchema,
  'support_chats'
);

const supportMessageSchema = new Schema<ISupportMessage>(
  {
    supportChatId: {
      type: Schema.Types.ObjectId,
      ref: 'SupportChat',
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    senderRole: {
      type: String,
      enum: ERole,
      required: true,
    },
    content: {
      type: String,
      maxlength: 2000,
    },
    attachments: {
      type: [String],
      default: [],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    readerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index for pagination
supportMessageSchema.index({ supportChatId: 1, createdAt: -1 });

export const SupportMessageModel = mongoose.model<ISupportMessage>(
  'SupportMessage',
  supportMessageSchema,
  'support_messages'
);
