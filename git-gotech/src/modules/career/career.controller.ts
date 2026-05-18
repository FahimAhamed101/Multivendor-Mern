import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { Request, Response } from "express";
import { ApplicationFormSchema, CareerSchema } from "./career.interface";
import { ApplicationForm, Career } from "./career.model";
import mongoose from "mongoose";
import ApiError from "../../errors/ApiError";
import paginationBuilder from "../../utils/paginationBuilder";
import { UserModel } from "../user/user.model";

const addJob = catchAsync(async (req: Request, res: Response) => {
  CareerSchema.parse(req.body);
  const result = await Career.create(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "New job is added successfully",
    data: result,
  });
});

const applyJob = catchAsync(async (req: Request, res: Response) => {
  // ApplicationFormSchema.parse(req.body);
  const jobId = req.params.jobId;

  const job = await Career.findOne({
    isActive: true,
    _id: new mongoose.Types.ObjectId(jobId || "n/a"),
  }).lean();

  if (!job) {
    throw new ApiError(httpStatus.BAD_REQUEST, "This job is not available");
  }

  const personalInfo = JSON.parse(req.body.personalInfo);
  const workExperiences = JSON.parse(req.body.workExperiences);
  const educations = JSON.parse(req.body.educations);
  const skills = JSON.parse(req.body.skills);
  const languages = JSON.parse(req.body.languages);
  const references = JSON.parse(req.body.references);

  // CV Resume
  const files = req.files as Express.Multer.File[];

  // CV Resume
  const cvFile = files.find(file => file.fieldname === "cvResume");
  if (cvFile) {
    personalInfo.cvResume = cvFile.filename;
  }

  // Certifications (MATCH BY INDEX)
  const certifications = req.body.certifications.map(
    (cert: any, index: number) => {
      const file = files.find(
        (f) => f.fieldname === `certifications[${index}][file]`
      );

      return {
        certificateName: cert.certificateName.replace(/"/g, ""), // remove extra quotes
        file: file ? file.filename : null,
      };
    }
  );

  // const payload = {
  //   personalInfo,
  //   workExperiences,
  //   educations,
  //   skills,
  //   languages,
  //   references,
  //   certifications
  // }

  // User Not Found
  console.log()
  const user = await UserModel.findById(req.user?.id);
  console.log(user)
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User not found");
  }

  // check if user already applied for this job
  const existingApplication = await ApplicationForm.findOne({
    jobId: job?._id,
    userId: req.user?.id,
  });
  if (existingApplication) {
    throw new ApiError(httpStatus.BAD_REQUEST, "You already applied for this job");
  }

  const result = await ApplicationForm.create({
    personalInfo,
    workExperiences,
    educations,
    skills,
    languages,
    references,
    certifications,
    jobId: job?._id,
    user: user._id,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Your application is submmited successfully",
    data: result,
  });
});

const getJobs = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const searchQ = req.query.searchQ as string;
  const country = req.query.country as string;
  let query: any = { isActive: true };
  if (searchQ?.trim()) {
    query.$or = [
      {
        name: { $regex: searchQ, $options: "i" },
      },
      {
        address: { $regex: searchQ, $options: "i" },
      },
      {
        jobType: { $regex: searchQ, $options: "i" },
      },
      {
        description: { $regex: searchQ, $options: "i" },
      },
    ];
  }
  if (country?.trim()) {
    query.$or = [
      {
        address: { $regex: country, $options: "i" },
      },
      {
        country: { $regex: country, $options: "i" },
      },
    ];
  }

  const result = await Career.find(query).skip(skip).limit(limit).lean();
  const totalData = await Career.countDocuments(query);
  const pagination = paginationBuilder({ totalData, currentPage: page, limit });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Get jobs",
    data: result,
    pagination,
  });
});
const getJobDetails = catchAsync(async (req: Request, res: Response) => {
  const jobId = req.params.jobId;
  const job = await Career.findOne({
    isActive: true,
    _id: new mongoose.Types.ObjectId(jobId || "n/a"),
  }).lean();
  if (!job) {
    throw new ApiError(httpStatus.BAD_REQUEST, "This job is not available");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Job Details",
    data: job,
  });
});

const getApplications = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const jobId = req.params.jobId;
  const searchQ = req.query.searchQ as string;
  let query: any = {
    jobId: new mongoose.Types.ObjectId(jobId || "n/a"),
  };
  if (searchQ?.trim()) {
    query.$or = [
      {
        "personalInfo.fullName": { $regex: searchQ, $options: "i" },
      },
      {
        "personalInfo.phoneNumber": { $regex: searchQ, $options: "i" },
      },
      {
        "personalInfo.currentLocation": { $regex: searchQ, $options: "i" },
      },
    ];
  }

  const result = await ApplicationForm.find(query)
    .select("personalInfo createdAt")
    .skip(skip)
    .limit(limit)
    .lean();
  const totalData = await ApplicationForm.countDocuments(query);
  const pagination = paginationBuilder({ totalData, currentPage: page, limit });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Get job applications",
    data: result,
    pagination,
  });
});
const getApplicationDetails = catchAsync(
  async (req: Request, res: Response) => {
    const applicationId = req.params.applicationId;
    const application = await ApplicationForm.findOne({
      _id: new mongoose.Types.ObjectId(applicationId || "n/a"),
    }).lean();
    if (!application) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "This application is not found",
      );
    }

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Job Application Details",
      data: application,
    });
  },
);

const editJob = catchAsync(async (req: Request, res: Response) => {
  const jobId = req.params.jobId;
  CareerSchema.parse(req.body);
  const job = await Career.findOneAndUpdate(
    {
      isActive: true,
      _id: new mongoose.Types.ObjectId(jobId || "n/a"),
    },
    req.body,
    { new: true, runValidators: true },
  ).lean();
  if (!job) {
    throw new ApiError(httpStatus.BAD_REQUEST, "This job is not available");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Job details updated",
    data: job,
  });
});
const deleteJob = catchAsync(async (req: Request, res: Response) => {
  const jobId = req.params.jobId;
  const job = await Career.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(jobId || "n/a"),
    },
    { isActive: false },
    { new: true, runValidators: true },
  ).lean();
  if (!job) {
    throw new ApiError(httpStatus.BAD_REQUEST, "This job is not available");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Job Deleted",
    data: true,
  });
});
export const CareerController = {
  addJob,
  applyJob,
  getJobs,
  getJobDetails,
  getApplications,
  getApplicationDetails,
  editJob,
  deleteJob,
};
