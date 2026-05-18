import { Schema, model } from "mongoose";
import { EPaymentStatus, EPaymentType, IPayment } from "./payment.interface";

const paymentSchema = new Schema<IPayment>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 1
        },
        currency: {
            type: String,
            required: true,
        },
        targetEnv: {
            type: String,
            required: true,
        },
        countryCode: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        referenceId: {
            type: String,
            required: true,
            unique: true
        },
        externalId: {
            type: String,
            required: true,
            unique: true
        },
        provider: {
            type: String,
            enum: ["momo"],
            default: "momo"
        },
        type: {
            type: String,
            required: true,
            enum: EPaymentType,
            default: EPaymentType.WALLET_TOPUP
        },
        status: {
            type: String,
            required: true,
            enum: EPaymentStatus,
            default: EPaymentStatus.PENDING,
            index: true
        },
        failureReason: {
            type: String,
        },
        metadata: {
            type: Schema.Types.Mixed,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
)

paymentSchema.index({ userId: 1, createdAt: -1 });

export const Payment = model<IPayment>("Payment", paymentSchema);