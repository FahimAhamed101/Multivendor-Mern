// paymentCard.validation.ts
import { z } from "zod";

export const storePaymentCardSchema = z.object({
  body: z.object({
    bankName: z.string().min(1,"Bank Name is Required"),
    accountName: z.string().min(1, "Account Name is Required"),
    accountNumber: z.string().min(1, "Account Number is Required"),
    bankCode: z.string().min(1,"Bank Code is Required"),
    country: z.string().min(1,"Country is Required"),
    moreInfo: z.string().optional(),
  }),
});
