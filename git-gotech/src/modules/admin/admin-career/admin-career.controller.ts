import { Request, Response } from "express";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import httpStatus from "http-status";
import { Career, ApplicationForm } from "../../career/career.model";
import { AggregateQueryBuilder } from "../../../utils/AggregateQueryBuilder";
import ApiError from "../../../errors/ApiError";
import { Types } from "mongoose";

const getAllJobs = catchAsync(async (req: Request, res: Response) => {
  const queryBuilder = new AggregateQueryBuilder(
    Career,
    [],
    req.query as Record<string, string>
  )
    .filter()
    .search(["title", "country", "address"])
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
    message: "Career jobs retrieved successfully",
    data: {
      meta,
      data,
    },
  });
});

const addJob = catchAsync(async (req: Request, res: Response) => {
  const result = await Career.create(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Career job created successfully",
    data: result,
  });
});

const updateJob = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await Career.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "Career job not found");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Career job updated successfully",
    data: result,
  });
});

const getAllApplications = catchAsync(async (req: Request, res: Response) => {
  const { jobId } = req.params;
  const basePipeline = [
    {
      $match: {
        jobId: new Types.ObjectId(jobId),
      },
    },
    {
      $lookup: {
        from: "careers",
        localField: "jobId",
        foreignField: "_id",
        as: "jobDetails",
      },
    },
    {
      $unwind: {
        path: "$jobDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userDetails",
        pipeline: [
          {
            $project: {
              name: 1,
              bio: 1,
              username: 1,
              email: 1,
              phone: 1,
              image: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: "$userDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
  ];

  const queryBuilder = new AggregateQueryBuilder(
    ApplicationForm,
    basePipeline,
    req.query as Record<string, string>
  )
    .filter()
    .search(["personalInfo.fullName", "personalInfo.phoneNumber", "jobDetails.title"])
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
    message: "Job applications retrieved successfully",
    data: {
      meta,
      data,
    },
  });
});

const getApplicationDetails = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ApplicationForm.findById(id)
    .populate("jobId")
    .populate({
      path: "user",
      select: "name email phone image",
    });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "Application not found");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Application details retrieved successfully",
    data: result,
  });
});

export const AdminCareerController = {
  getAllJobs,
  addJob,
  updateJob,
  getAllApplications,
  getApplicationDetails,
};
