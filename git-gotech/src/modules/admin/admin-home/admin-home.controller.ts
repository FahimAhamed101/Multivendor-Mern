import { Request, Response } from "express";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import httpStatus from "http-status";
import { AdminHomeService } from "./admin-home.service";

const getAdminDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminHomeService.getAdminDashboardStats();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin dashboard statistics retrieved successfully",
    data: result,
  });
});

const getYearlyRevenue = catchAsync(async (req: Request, res: Response) => {
  const year = parseInt(req.query.year as string) || new Date().getFullYear();
  const result = await AdminHomeService.getYearlyRevenue(year);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Yearly revenue for ${year} retrieved successfully`,
    data: result,
  });
});

const getUserVendorRatio = catchAsync(async (req: Request, res: Response) => {
  const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
  const year = parseInt(req.query.year as string) || new Date().getFullYear();
  const result = await AdminHomeService.getUserVendorRatio(year, month);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User and vendor join ratio retrieved successfully",
    data: result,
  });
});

const getRecentUsers = catchAsync(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const result = await AdminHomeService.getRecentUsers(limit);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Recently joined users retrieved successfully",
    data: result,
  });
});

const getRecentVendors = catchAsync(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const result = await AdminHomeService.getRecentVendors(limit);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Recently joined vendors retrieved successfully",
    data: result,
  });
});

export const AdminHomeController = {
  getAdminDashboardStats,
  getYearlyRevenue,
  getUserVendorRatio,
  getRecentUsers,
  getRecentVendors,
};
