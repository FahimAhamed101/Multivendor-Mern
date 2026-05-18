import { ZodError } from "zod";
import { ErrorRequestHandler } from "express";
import { IErrorResponse } from "../interface/error";
import handlerZodError from "../errors/handleZodError";
import mongoose from "mongoose";
import handleValidationError from "../errors/handleValidationError";
import handlerCastError from "../errors/handleCastError";
import handlerDuplicateError from "../errors/handleDuplicateError";
import ApiError from "../errors/ApiError";

const errorTypeMap: Record<number, string> = {
  400: "Bad Request",
  401: "Unauthorized",
  402: "Payment Required",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  406: "Not Acceptable",
  407: "Proxy Authentication Required",
  408: "Request Timeout",
  409: "Conflict",
  410: "Gone",
  411: "Length Required",
  412: "Precondition Failed",
  413: "Payload Too Large",
  414: "URI Too Long",
  415: "Unsupported Media Type",
  416: "Range Not Satisfiable",
  417: "Expectation Failed",
  418: "I'm a Teapot",
  422: "Unprocessable Entity",
  423: "Locked",
  424: "Failed Dependency",
  425: "Too Early",
  426: "Upgrade Required",
  428: "Precondition Required",
  429: "Too Many Requests",
  431: "Request Header Fields Too Large",
  451: "Unavailable For Legal Reasons",
  498: "Session Expired",
  499: "Client Closed Request",
  500: "Internal Server Error",
  501: "Not Implemented",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout",
  505: "HTTP Version Not Supported",
  506: "Variant Also Negotiates",
  507: "Insufficient Storage",
  508: "Loop Detected",
  510: "Not Extended",
  511: "Network Authentication Required",
};

const globalErrorHandler: ErrorRequestHandler = (error, req, res, next) => {
  let errorInfo: IErrorResponse = {
    success: false,
    statusCode: 500,
    errorType: "Invalid request",
    errorMessage: "",

    errorDetails: { path: null, value: null },
  };

  // 1. Check for ApiError first
  if (error instanceof ApiError) {
    errorInfo.statusCode = error.statusCode;
    errorInfo.errorMessage = error.message;
    errorInfo.errorDetails = error.errorDetails || { path: null, value: null };

    // 2. Then check the other known error types
  } else if (error instanceof ZodError) {
    errorInfo = handlerZodError(error);
  } else if (error instanceof mongoose.Error.ValidationError) {
    errorInfo = handleValidationError(error);
  } else if (error instanceof mongoose.Error.CastError) {
    errorInfo = handlerCastError(error);
  } else if (error?.code === 11000) {
    errorInfo = handlerDuplicateError(error);

    // 3. Finally, any generic errors
  } else if (error instanceof Error) {
    // console.log(error,"-----error")
    errorInfo.errorMessage = error.message;
  }
  // Dynamically set errorType based on statusCode
  errorInfo.errorType = errorTypeMap[errorInfo.statusCode] || "Unknown Error";
  // Return the JSON response
  //console.log(first)
  return res.status(errorInfo.statusCode).json({
    success: errorInfo.success,
    path: req.originalUrl,
    status: errorInfo.statusCode,
    errorType: errorInfo.errorType,
    message: errorInfo.errorMessage,
    // errorDetails: errorInfo.errorDetails,
    // stack is hidden unless in dev
    //stack: NODE_ENV === "development" ? error.stack : null,
  });
};

export default globalErrorHandler;
// import type { NextFunction, Request, Response } from "express"
// import httpStatus from "http-status"
// import AppError from "../helpers/AppError"
// import { TErrorSources } from "../interface/error";
// import handlerDuplicateError from "../errors/handleDuplicateError";
// import handlerCastError from "../errors/handleCastError";
// import handlerZodError from "../errors/handleZodError";
// import handleValidationError from "../errors/handleValidationError";

// export const globalErrorHandler = async (err: any, req: Request, res: Response, next: NextFunction) => {
//   if (process.env.NODE_ENV === "development") {
//     console.log(err);
//   }

//   // if (req.file) {
//   //   await deleteImageFromCloudinary(req.file.path)
//   // }

//   // if (req.files && Array.isArray(req.files) && req.files.length > 0) {
//   //   const imageUrls = (req.files as Express.Multer.File[]).map(file => file.path)

//   //   await Promise.all(imageUrls.map(url => deleteImageFromCloudinary(url)))
//   // }

//   let errorsSources: TErrorSources[] = []
//   let statusCode = httpStatus.INTERNAL_SERVER_ERROR
//   let message = `Something went wrong!!`

//   if (err.code === 11000) {
//     const simplifiedError = handlerDuplicateError(err)
//     statusCode = simplifiedError.statusCode
//     message = simplifiedError.message
//   }

//   else if (err.name === "CastError") {
//     const simplifiedError = handlerCastError(err)
//     statusCode = simplifiedError.statusCode
//     message = simplifiedError.message
//   }

//   else if (err.name === "ZodError") {
//     const simplifiedError = handlerZodError(err)

//     statusCode = simplifiedError.statusCode
//     message = simplifiedError.message
//     errorsSources = simplifiedError.errorsSources!
//   }

//   // Mongoose Validation Error
//   else if (err.name === "ValidationError") {
//     const simplifiedError = handleValidationError(err)

//     statusCode = simplifiedError.statusCode
//     errorsSources = simplifiedError.errorsSources!
//     message = simplifiedError.message
//   }

//   else if (err instanceof AppError) {
//     statusCode = err.statusCode
//     message = err.message
//     errorsSources = err.errorSources
//   }

//   else if (err instanceof Error) {
//     statusCode = httpStatus.INTERNAL_SERVER_ERROR
//     message = err.message
//   }

//   res.status(statusCode).json({
//     success: false,
//     message,
//     errorsSources,
//     data: err.data || null,
//     err: process.env.NODE_ENV === "development" ? err : null,
//     stack: process.env.NODE_ENV === "development" ? err.stack : null
//   })
// }