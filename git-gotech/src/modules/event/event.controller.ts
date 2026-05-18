import { Request, Response } from "express";
import { IUserPayload } from "../../middlewares/roleGuard";
import catchAsync from "../../utils/catchAsync";
import { validateUserLockStatus } from "../../middlewares/lock";
import mongoose from "mongoose";
import { EventProduct, Events, SizeSubmission } from "./event.model";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import { Product } from "../product/product.model";
import { UserModel } from "../user/user.model";
import paginationBuilder from "../../utils/paginationBuilder";
import { FindQueryBuilder } from "../../utils/FindQueryBuilder";
import { hashPassword, sendEventInvitationEmail } from "../user/user.utils";

const addEvent = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserPayload;
  await validateUserLockStatus(new mongoose.Types.ObjectId(user.id || "n/a"));

  const result = await Events.findOneAndUpdate(
    {
      ...req.body,
      customer: user.id,
    },
    { ...req.body, customer: user.id },
    { new: true, upsert: true, runValidators: true },
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Custom order placed successfully",
    data: result,
  });
});

const getEvent = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const user = req.user as IUserPayload;
  const type = req.query.type as string;
  let query: any = {};
  if (type === "invited") {
    query.participant = { $in: [new mongoose.Types.ObjectId(user.id)] };
  } else if (type === "created") {
    query.customer = new mongoose.Types.ObjectId(user.id);
  } else {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Event type is required in query parameter ('created' or 'invited')",
    );
  }
  const result: any = await Events.find(query)
    .populate("customer", "name email image")
    .populate("participant", "name email image")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const totalData = await Events.countDocuments(query);
  const pagination = paginationBuilder({ totalData, currentPage: page, limit });
  const response = result.map((data: any) => {
    return { ...data, participantCount: data.participant.length || 0 };
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Get events",
    data: { data: response, eventType: type === "invited" ? "invited" : "" },
    pagination,
  });
});

const updateEvent = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserPayload;
  await validateUserLockStatus(new mongoose.Types.ObjectId(user.id || "n/a"));

  const result = await Events.findOneAndUpdate(
    {
      ...req.body,
      customer: user.id,
    },
    { ...req.body, customer: user.id },
    { new: true, upsert: true, runValidators: true },
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Event updated successfully",
    data: result,
  });
});

const addEventProduct = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserPayload;
  if (req.body?.isOrderd) {
    throw new ApiError(httpStatus.BAD_REQUEST, "You can't pass isOrderd value");
  }
  if (!req.body?.event || !req.body?.product) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Event and product must be include in request body",
    );
  }
  await validateUserLockStatus(new mongoose.Types.ObjectId(user.id || "n/a"));
  const ownerValidation = await Events.findOne({
    customer: new mongoose.Types.ObjectId(user.id || "n/a"),
  }).lean();
  if (!ownerValidation) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Only event owner can be add product into the event",
    );
  }
  const productValidation = await Product.findOne({
    _id: new mongoose.Types.ObjectId(req.body?.product || "n/a"),
  }).lean();
  if (!productValidation) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Choose another product");
  }
  const result = await EventProduct.findOneAndUpdate(
    {
      ...req.body,
    },
    { ...req.body },
    { new: true, upsert: true, runValidators: true },
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Event product added successfully",
    data: result,
  });
});

const addEventMember = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserPayload;
  const { event, memberDetails: memberDetailsString } = req.body;
  const memberDetails = typeof memberDetailsString === "string" ? JSON.parse(memberDetailsString) : memberDetailsString;
  console.log(memberDetails)
  const inviteCard = req.file;
  console.log(inviteCard);

  if (!event || !memberDetails?.email || !memberDetails?.name) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Event and member details (name, email) are required",
    );
  }

  await validateUserLockStatus(new mongoose.Types.ObjectId(user.id || "n/a"));

  // 1. Check if event exists and user is owner
  const eventData = await Events.findOne({
    _id: new mongoose.Types.ObjectId(event),
    customer: new mongoose.Types.ObjectId(user.id),
  });

  if (!eventData) {
    throw new ApiError(httpStatus.NOT_FOUND, "Event not found or unauthorized");
  }

  // 2. Check if user already exists
  let targetUser = await UserModel.findOne({ email: memberDetails.email });

  if (targetUser) {
    // Check if already in participant list
    const isAlreadyParticipant = eventData.participant.includes(targetUser._id as any);
    if (isAlreadyParticipant) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Member already added to this event");
    }

    // Add to participants
    eventData.participant.push(targetUser._id as any);
    await eventData.save();

    // Send invitation email
    await sendEventInvitationEmail({
      email: targetUser.email,
      name: targetUser.name,
      subject: `You're Invited to !`,
      type: "invitation",
      inviteCardPath: inviteCard?.filename,
    });
  } else {
    // Create new user
    const username = memberDetails.email.split("@")[0] + Math.floor(1000 + Math.random() * 9000);
    const hashedPassword = await hashPassword("123456");

    targetUser = await UserModel.create({
      name: memberDetails.name,
      email: memberDetails.email,
      username,
      password: hashedPassword,
      role: "customer",
      isVerified: true,
      isRequest: "approve",
    });

    // Add to participants
    eventData.participant.push(targetUser._id as any);
    await eventData.save();

    // Send credentials email
    await sendEventInvitationEmail({
      email: targetUser.email,
      name: targetUser.name,
      subject: `Welcome to ${process.env.AppName}!`,
      type: "credentials",
      password: "123456",
      inviteCardPath: inviteCard?.filename,
    });
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Event member added and notified successfully",
    data: eventData,
  });
});

const addEventProductSize = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserPayload;

  if (!req.body?.event || !req.body?.member || !req.body?.product) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Event, member and product must be include in request body",
    );
  }

  if (!req.body?.size?.trim()) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid size");
  }

  await validateUserLockStatus(new mongoose.Types.ObjectId(user.id || "n/a"));

  const memberValidation = await UserModel.findOne({
    _id: new mongoose.Types.ObjectId(req.body.member || "n/a"),
    isDeleted: false,
    isVerified: true,
  }).lean();

  if (!memberValidation) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Sorry! Choose another member");
  }

  const eventCheck = await Events.findOne({
    _id: new mongoose.Types.ObjectId(req.body.event || "n/a"),
    $or: [
      {
        customer: new mongoose.Types.ObjectId(user.id || "n/a"),
      },
      {
        participant: { $in: [new mongoose.Types.ObjectId(user.id || "n/a")] },
      },
    ],
  }).lean();

  if (!eventCheck) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Unauthorized action");
  }

  const result = await SizeSubmission.findOneAndUpdate(
    {
      product: new mongoose.Types.ObjectId(req.body.product || "n/a"),
      customer: new mongoose.Types.ObjectId(req.body.member || "n/a"),
      event: new mongoose.Types.ObjectId(req.body.event || "n/a"),
    },
    { ...req.body },
    { new: true, upsert: true, runValidators: true },
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product size added successfully",
    data: result,
  });
});

const getEventMemberSuggestion = catchAsync(async (req: Request, res: Response) => {
  const queryBuilder = new FindQueryBuilder(UserModel.find({ role: "customer", isDeleted: false, isVerified: true }), req.query as Record<string, any>)

  const result = await queryBuilder
    .filter()
    .search(["email"])
    .sort()
    .fields()
    .buildWithMeta()

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Get event member suggestion",
    data: result,
  });
});

const getEventProduct = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const eventId = req.params.eventId;
  const user = req.user as IUserPayload;
  const ownerValidation = await Events.findOne({
    customer: new mongoose.Types.ObjectId(user.id || "n/a"),
  }).lean();
  // if (!ownerValidation) {
  //   throw new ApiError(
  //     httpStatus.BAD_REQUEST,
  //     "Only event owner can be see event product",
  //   );
  // } 
  let query: any = {
    event: new mongoose.Types.ObjectId(eventId),
  };

  let result = await EventProduct.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate({
      path: "event",
      populate: {
        path: "customer",
        select: "_id name email image"
      },
      select: "customer purchaseOption"
    })
    .populate({
      path: "product",
      populate: {
        path: "showroom",
        select: "showroom_name logo location",
      },
      select:
        "showroom review_count review_rating category product_images product_price product_stocks product_name",
    })
    .lean();
  const totalData = await EventProduct.countDocuments(query);
  const response = result.map((element) => {
    return {
      ...element,
    };
  });
  const pagination = paginationBuilder({ totalData, currentPage: page, limit });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Get event products",
    data: response,
    pagination,
  });
});

const getEventProductSize = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const user = req.user as IUserPayload;

  let query = {
    event: new mongoose.Types.ObjectId(req.query.event as string || "n/a"),
    product: new mongoose.Types.ObjectId(req.query.product as string || "n/a"),
  };

  const submission: any = await SizeSubmission.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate({
      path: "customer",
      select: "name image email",
    })
    .populate({
      path: "product",
      select: "product_name product_images product_price showroom",
      populate: {
        path: "showroom",
        select: "showroom_name logo location",
      },
    })
    .lean();

  // console.log(submission)

  // if (
  //   submission.event.customer.toString() !== user.id &&
  //   participants.some((p: any) => p._id.toString() !== user.id)
  // ) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, "Invalid action");
  // }

  const response = submission.map((submissionOne: any, index: number) => {
    return {
      ...submissionOne,
    }
  });

  const totalData = await SizeSubmission.countDocuments(query);

  const pagination = paginationBuilder({ totalData, currentPage: page, limit });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Get event product size",
    data: response,
    pagination,
  });
});

const getEventMembers = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const eventId = req.params.eventId;
  const user = req.user as IUserPayload;

  const eventCheck = await Events.findOne({
    _id: new mongoose.Types.ObjectId(eventId || "n/a"),
    $or: [
      {
        customer: new mongoose.Types.ObjectId(user.id || "n/a"),
      },
      {
        participant: { $in: [new mongoose.Types.ObjectId(user.id || "n/a")] },
      },
    ],
  }).lean();

  if (!eventCheck) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Unauthorized action to view event members");
  }

  // Find the event and populate just the participants with pagination
  const event: any = await Events.findById(eventId)
    .populate({
      path: "participant",
      select: "name email image username phone gender isOnline",
      options: { sort: { createdAt: -1 }, skip: skip, limit: limit }
    })
    .lean();

  // Since we are paginating the populate, we need the total count of participants in the array
  const totalData = eventCheck.participant?.length || 0;
  const pagination = paginationBuilder({ totalData, currentPage: page, limit });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Get event participators successfully",
    data: event.participant || [],
    pagination,
  });
});

export const EventController = {
  addEvent,
  updateEvent,
  getEvent,
  addEventProduct,
  addEventMember,
  addEventProductSize,
  getEventMemberSuggestion,
  getEventProduct,
  getEventProductSize,
  getEventMembers,
};
// 01933709419
