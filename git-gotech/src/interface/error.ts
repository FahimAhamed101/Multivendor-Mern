export type IErrorResponse = {
  success: false;
  errorType: string;
  errorMessage: string;
  statusCode: number;
  errorDetails: Record<string, unknown>;
};


// export interface TErrorSources {
//     path: string
//     message: string
// }

// export interface TGenericErrorResponse {
//     statusCode: number
//     message: string,
//     errorsSources?: TErrorSources[]
// }