import { Request, Response } from 'express';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import ApiError from '../../errors/ApiError';
import { IUserPayload } from '../../middlewares/roleGuard';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { SupportChatModel, SupportMessageModel } from './support.model';
import { AggregateQueryBuilder } from '../../utils/AggregateQueryBuilder';

const initSupportChat = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserPayload;
  const { message } = req.body;
  const files = req.files as Express.Multer.File[];
  const attachments = files?.map((file) => file.filename) || [];

  if (!message && attachments.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'A message or at least one attachment is required');
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const supportChat = await SupportChatModel.create(
      [
        {
          userId: user.id,
          lastMessage: message ? message : '[Attachment]',
          lastMessageAt: new Date(),
          status: 'active',
        },
      ],
      { session }
    );

    const supportMessage = await SupportMessageModel.create(
      [
        {
          supportChatId: supportChat[0]._id,
          senderId: user.id,
          senderRole: user.role,
          content: message || '',
          attachments,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Support chat initiated successfully',
      data: {
        chat: supportChat[0],
        message: supportMessage[0],
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});

const getSupportChats = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserPayload;

  if (['admin', 'manager', 'support'].includes(user.role)) {
    // Staff view: Use AggregateQueryBuilder for filtering, searching, and pagination
    const basePipeline: any[] = [
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          'user.password': 0,
          'user.__v': 0,
          'userId': 0,
        },
      },
    ];

    const queryBuilder = new AggregateQueryBuilder(
      SupportChatModel,
      basePipeline,
      req.query as Record<string, string>
    )
      .filter()
      .search(['lastMessage', 'user.name', 'user.email'])
      .sort()
      .paginate();

    const [data, meta] = await Promise.all([
      queryBuilder.build(),
      queryBuilder.getMeta(),
    ]);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Support chats retrieved successfully',
      data: {
        meta,
        data,
      },
    });
  } else {
    // Customer view: Always return only the latest active chat
    const query = {
      userId: new mongoose.Types.ObjectId(user.id),
      status: 'active',
    };

    const result = await SupportChatModel.findOne(query)
      .populate('userId', 'name email image')
      .sort({ lastMessageAt: -1 });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: result ? 'Support chat retrieved successfully' : 'No active support chat found',
      data: result,
    });
  }
});

const getSupportMessages = catchAsync(async (req: Request, res: Response) => {
  const { chatId } = req.params;
  const user = req.user as IUserPayload;

  // Check if chat exists and user has access
  const chat = await SupportChatModel.findById(chatId);
  if (!chat) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Support chat not found');
  }

  if (
    !['admin', 'manager', 'support'].includes(user.role) &&
    chat.userId.toString() !== user.id
  ) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Access denied');
  }

  // Update unread messages sent by others
  const unreadQuery: any = {
    supportChatId: chatId,
    senderId: { $ne: new mongoose.Types.ObjectId(user.id) },
    isRead: false,
  };

  const updateData: any = {
    isRead: true,
    readAt: new Date(),
  };

  // If staff is reading, track which staff member read it
  if (['admin', 'manager', 'support'].includes(user.role)) {
    updateData.readerId = new mongoose.Types.ObjectId(user.id);
  }

  await SupportMessageModel.updateMany(unreadQuery, updateData);

  const result = await SupportMessageModel.find({ supportChatId: chatId })
    .populate('senderId', 'name email image')
    .populate('readerId', 'name email image')
    .sort({ createdAt: 1 });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Support messages retrieved successfully',
    data: result,
  });
});

const sendSupportMessage = catchAsync(async (req: Request, res: Response) => {
  const { chatId } = req.params;
  const { message } = req.body;
  const user = req.user as IUserPayload;
  const files = req.files as Express.Multer.File[];
  const attachments = files?.map((file) => file.filename) || [];

  if (!message && attachments.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Message content or at least one attachment is required');
  }

  const chat = await SupportChatModel.findById(chatId);
  if (!chat) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Support chat not found');
  }

  // Check access
  if (
    !['admin', 'manager', 'support'].includes(user.role) &&
    chat.userId.toString() !== user.id
  ) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Access denied');
  }

  const result = await SupportMessageModel.create({
    supportChatId: chatId,
    senderId: user.id,
    senderRole: user.role,
    content: message || '',
    attachments,
  });

  // Update last message in chat
  await SupportChatModel.findByIdAndUpdate(chatId, {
    lastMessage: message || (attachments.length > 0 ? '[Attachment]' : ''),
    lastMessageAt: new Date(),
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Message sent successfully',
    data: result,
  });
});

const resolveSupportChat = catchAsync(async (req: Request, res: Response) => {
  const { chatId } = req.params;
  const user = req.user as IUserPayload;

  // Only staff can resolve
  if (!['admin', 'manager', 'support'].includes(user.role)) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only staff can resolve chats');
  }

  const chat = await SupportChatModel.findByIdAndUpdate(
    chatId,
    { status: 'resolved' },
    { new: true }
  );

  if (!chat) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Support chat not found');
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Support chat marked as resolved',
    data: chat,
  });
});

export const SupportController = {
  initSupportChat,
  getSupportChats,
  getSupportMessages,
  sendSupportMessage,
  resolveSupportChat,
};
