import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { PaymentCardService } from "./payment-card.service";
import { JwtPayload } from "jsonwebtoken";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

const storePaymentCardInfo = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await PaymentCardService.storePaymentCardInfo(
      req.body,
      req.user?.id
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Payment Card Info Saved Successfully",
      data: result,
    });
  }
);

const getAllCardInfo = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await PaymentCardService.getAllCardInfo(
      req.user?.id
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: result.length > 0 ? "Fetched All Card Info Successfully" : "No Card Info Found",
      data: result,
    });
  }
);

const getSingleCardInfo = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Implementation for fetching single card info goes here
    const cardId = req.query.cardId as string;
    const result = await PaymentCardService.getSingleCardInfo(
      req.user?.id,
      cardId
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Fetched Single Card Info Successfully",
      data: result,
    });
  }
);

const deleteSingleCardInfo = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const cardId = req.query.cardId as string;
    const result = await PaymentCardService.deleteSingleCardInfo(
      req.user?.id,
      cardId
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Deleted Single Card Info Successfully",
      data: result,
    });
  }
);

export const PaymentCardController = {
  storePaymentCardInfo,
  getAllCardInfo,
  getSingleCardInfo,
  deleteSingleCardInfo
};
