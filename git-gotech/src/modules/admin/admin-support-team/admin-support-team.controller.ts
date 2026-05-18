import { Request, Response } from "express";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import httpStatus from "http-status";
import { UserModel } from "../../user/user.model";
import { AggregateQueryBuilder } from "../../../utils/AggregateQueryBuilder";
import { hashPassword, sendSupportInvitationEmail } from "../../user/user.utils";
import Setting from "../../settings/settings.model";
import ApiError from "../../../errors/ApiError";


const getAllSupport = catchAsync(async (req: Request, res: Response) => {
    const basePipeline = [
        {
            $match: {
                role: "support",
                isDeleted: false,
            },
        },
        {
            $project: {
                password: 0,
                __v: 0
            }
        }
    ];

    const queryBuilder = new AggregateQueryBuilder(
        UserModel,
        basePipeline,
        req.query as Record<string, string>
    )
        .filter()
        .search(["name", "email", "username"])
        .sort()
        .fields()
        .paginate();

    const [data, meta] = await Promise.all([
        queryBuilder.build(),
        queryBuilder.getMeta(),
    ]);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Support team retrieved successfully",
        data: {
            meta,
            data,
        },
    });
});

const getSupportDetails = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const support = await UserModel.findOne({ _id: id, role: "support" }).select("-password -__v");

    if (!support) {
        throw new ApiError(httpStatus.NOT_FOUND, "Support staff member not found");
    }

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Support details retrieved successfully",
        data: support,
    });
});

const addSupport = catchAsync(async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    const existingUser = await UserModel.findOne({ email }).select("-password -__v");
    if (existingUser) {
        throw new ApiError(httpStatus.BAD_REQUEST, "User with this email already exists");
    }

    const hashedPassword = await hashPassword(password);

    const supportData = {
        name,
        email,
        password: hashedPassword,
        role: "support",
        isRequest: "approve",
        username: email,
    };

    const newSupport = await UserModel.create(supportData);

    // Send invitation email
    await sendSupportInvitationEmail(name, email);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Support staff member created and invitation email sent successfully",
        data: {
            name: newSupport.name,
            email: newSupport.email,
            role: newSupport.role,
            isRequest: newSupport.isRequest,
            username: newSupport.username,
            _id: newSupport._id,
            createdAt: newSupport.createdAt,
            updatedAt: newSupport.updatedAt,
        },
    });
});

const toggleBlockSupport = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { block } = req.body;

    const support = await UserModel.findOne({ _id: id, role: "support" }).select("-password -__v");

    if (!support) {
        throw new ApiError(httpStatus.NOT_FOUND, "Support staff member not found");
    }

    if (support.blockStatus === true && block === true) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Support staff member is already blocked");
    }

    if (support.blockStatus === false && block === false) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Support staff member is already unblocked");
    }

    if (block) {
        support.blockStatus = true;
    } else {
        support.blockStatus = false;
    }

    await support.save();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `Support staff member ${block ? "blocked" : "unblocked"} successfully`,
        data: support,
    });
});

export const AdminSupportTeamController = {
    getAllSupport,
    getSupportDetails,
    addSupport,
    toggleBlockSupport,
};
