import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { transactionService } from "./transaction.service";
import { IUserPayload } from "../../middlewares/roleGuard";
import paginationBuilder from "../../utils/paginationBuilder";

const getMyWalletTransactions = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserPayload;
  
  const result = await transactionService.getUserWalletTransactions(user.id, req.query);

  const pagination = paginationBuilder({
    totalData: result.totalData,
    currentPage: result.page,
    limit: result.limit,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Wallet transactions retrieved successfully",
    data: result.transactions,
    pagination,
  });
});

export const TransactionController = {
  getMyWalletTransactions,
};
