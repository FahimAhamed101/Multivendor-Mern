import mongoose from "mongoose";
import { TransactionModel } from "./transaction.model";
import { IRecordTransactionPayload, ETransactionStatus } from "./transaction.interface";
import { UserModel } from "../user/user.model";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";

class TransactionService {
  /**
   * Universal helper function to record a transaction.
   * Can be used across other modules (e.g., Delivery Request) to ensure accurate logging.
   * Modifies the user's balance automatically if the status is SUCCESS.
   * Should ideally be wrapped in a mongoose session for production safety.
   */
  async recordTransaction(payload: IRecordTransactionPayload) {
    const { user, amount, type, description, referenceId, status = ETransactionStatus.SUCCESS, session } = payload;

    const userRecord = await UserModel.findById(user).session(session || null);
    if (!userRecord) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found for transaction");
    }

    const oldBalance = userRecord.balance;
    let newBalance = oldBalance;

    if (status === ETransactionStatus.SUCCESS) {
      if (type === "CREDIT") {
        newBalance = oldBalance + amount;
      } else if (type === "DEBIT") {
        if (oldBalance < amount) {
          throw new ApiError(httpStatus.BAD_REQUEST, "Insufficient balance");
        }
        newBalance = oldBalance - amount;
      }

      // Update the user's balance using partial update to avoid full document validation (e.g. username is required)
      await UserModel.findByIdAndUpdate(
        user,
        { balance: newBalance },
        { session, runValidators: false }
      );
    }

    // Record the history
    const transaction = await TransactionModel.create(
      [
        {
          user: new mongoose.Types.ObjectId(user.toString()),
          amount,
          type,
          status,
          description,
          referenceId,
          oldBalance,
          newBalance,
        },
      ],
      { session }
    );

    return transaction[0];
  }

  /**
   * Retrieves the wallet transaction history for a specific user
   */
  async getUserWalletTransactions(userId: string, query: Record<string, any> = {}) {
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const filter = { user: new mongoose.Types.ObjectId(userId) };

    const transactions = await TransactionModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalData = await TransactionModel.countDocuments(filter);
    
    return {
      transactions,
      totalData,
      page,
      limit,
    };
  }
}

export const transactionService = new TransactionService();
