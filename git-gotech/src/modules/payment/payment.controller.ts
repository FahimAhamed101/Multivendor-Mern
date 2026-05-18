import { NextFunction, Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import axios from "axios";
import { momoConfig } from "../../config";
import { Payment } from "./payment.model";
import { v4 as uuidv4 } from "uuid";
import httpStatus from "http-status";
import { EPaymentStatus, EPaymentType } from "./payment.interface";
import { TransactionController } from "../transaction/transaction.controller";
import { transactionService } from "../transaction/transaction.service";
import { ETransactionStatus, ETransactionType } from "../transaction/transaction.interface";
import { UserModel } from "../user/user.model";
import { emitNotification } from "../../utils/socket";
import { getMomoConfigFromPhone } from "../../config/momo.config";
import { TransactionModel } from "../transaction/transaction.model";

// ─── Helper: Get MoMo Bearer Token ───────────────────────────────────────────
async function getMomoAccessToken(): Promise<string> {
    const credentials = Buffer.from(
        `${momoConfig.apiUser}:${momoConfig.apiKey}`
    ).toString("base64");

    console.log(momoConfig.apiKey, momoConfig.apiUser)

    const response = await axios.post(
        `${momoConfig.baseUrl}/collection/token/`,
        {},
        {
            headers: {
                Authorization: `Basic ${credentials}`,
                "Ocp-Apim-Subscription-Key": momoConfig.subscriptionKey,
                "X-Target-Environment": momoConfig.isSandbox,
            },
        }
    );

    return response.data.access_token;
}

class Controller {
    addMoney = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { amount, phone } = req.body;
            const userId = req.user?.id;

            // ✅ Normalize phone — ensure + prefix for parsing, strip + for MTN
            const normalizedPhone = phone.startsWith("+") ? phone : `+${phone}`;

            // ✅ Auto-detect country, currency, targetEnv from phone number
            const { countryCode, currency, targetEnv } = getMomoConfigFromPhone(
                normalizedPhone,
                Boolean(momoConfig.isSandbox)
            );

            // 1. Generate IDs
            const referenceId = uuidv4();
            const externalId = `TOPUP_${uuidv4()}`;

            // 2. Create payment (pending)
            const payment = await Payment.create({
                userId,
                amount,
                phone,
                referenceId,
                externalId,
                targetEnv,
                countryCode,
                status: EPaymentStatus.PENDING,
                type: EPaymentType.WALLET_TOPUP,
                provider: "momo",
                currency: currency,
            });

            // 3. Create Transaction
            await transactionService.recordTransaction({
                user: userId,
                type: ETransactionType.CREDIT,
                amount: amount,
                referenceId: referenceId,
                status: ETransactionStatus.PENDING,
                description: "Wallet Top Up"
            })

            // 4. Get Bearer token
            const accessToken = await getMomoAccessToken();

            // 5. Call MoMo RequestToPay
            const momoResponse = await axios.post(
                `${momoConfig.baseUrl}/collection/v1_0/requesttopay`,
                {
                    amount: amount.toString(),
                    currency: currency,
                    externalId,
                    payer: {
                        partyIdType: "MSISDN",
                        partyId: phone,
                    },
                    payerMessage: "Wallet Topup",
                    payerNote: "Add Money to Wallet",
                    referenceId
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,           // ✅ required
                        "Ocp-Apim-Subscription-Key": momoConfig.subscriptionKey,
                        "X-Reference-Id": referenceId,
                        "X-Target-Environment": targetEnv,
                        "X-Callback-Url": momoConfig.callbackUrl,         // ✅ header, not body
                        "Content-Type": "application/json",
                    },
                }
            );

            // MoMo returns 202 Accepted — payment is now pending on customer's phone
            sendResponse(res, {
                statusCode: httpStatus.OK,
                success: true,
                message: "Payment request sent. Please accept on your mobile phone.",
                data: { paymentDetails: payment, referenceId, externalId, status: "pending" },
            });
        } catch (error) {
            console.log("err:  ", error)
            next(error);
        }
    });

    momoWebhook = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const externalId = req.body.externalId as string;
        const body = req.body;
        // console.log("Webhook headers:->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", req.headers, req.header)

        // console.log("Webhook received:", externalId, body);

        // 1. Find payment in DB
        const payment = await Payment.findOne({ externalId });
        if (!payment) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "Payment not found" });
        }

        // 2. Check status from webhook payload
        const status = body?.status?.toLowerCase(); // depends on MTN webhook payload

        if (status === "successful" && payment.status !== EPaymentStatus.SUCCESSFUL) {
            // 3. Update wallet
            const user = await UserModel.findByIdAndUpdate(payment.userId, { $inc: { balance: payment.amount } });
            if (!user) throw new Error("User not found");

            // 4. Update Transaction
            const transaction = await TransactionModel.findOneAndUpdate({ referenceId: payment.referenceId }, {
                status: ETransactionStatus.SUCCESS,
            }, { new: true })
            if (!transaction) throw new Error("Transaction not found");

            // 5. Update payment status
            payment.status = EPaymentStatus.SUCCESSFUL;
            await payment.save();

            // 6. Send notification to user
            await emitNotification({
                userId: payment.userId,
                userMsgTittle: "Payment Successful",
                userMsg: `Your wallet has been topped up with ${payment.amount} ${payment.currency}`,
                adminMsgTittle: "Payment Successful",
                adminMsg: `Your wallet has been topped up with ${payment.amount} ${payment.currency}`,
            });

            console.log("Payment Success")
        }
        else if (status === "FAILED") {
            payment.status = EPaymentStatus.FAILED;
            payment.failureReason = body?.reason || "Unknown";
            await payment.save();
        }

        // 6. Respond 200 to MoMo
        res.sendStatus(200);
    });

    getPaymentStatus = catchAsync(async (req: Request, res: Response) => {
        const { referenceId } = req.params;

        // Check your DB first
        const payment = await Payment.findOne({ referenceId });
        if (!payment) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "Payment not found" });
        }

        // Optionally also fetch live status from MTN
        const accessToken = await getMomoAccessToken();
        const { data: momoStatus } = await axios.get(
            `${momoConfig.baseUrl}/collection/v1_0/requesttopay/${referenceId}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Ocp-Apim-Subscription-Key": momoConfig.subscriptionKey,
                    "X-Target-Environment": payment.targetEnv,
                },
            }
        );

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Payment status fetched",
            data: {
                db: payment,
                momo: momoStatus, // live status from MTN
            },
        });
    });
}

export const PaymentController = new Controller();