import { JwtPayload } from "jsonwebtoken";
import { IPaymentCard } from "./payment-card.interface";
import { UserModel } from "../user/user.model";
import { PaymentCard } from "./payment-card.model";
import AppError from "../../helpers/AppError";
import httpStatus from "http-status";

const MAX_CARDS_PER_USER = 5;

const storePaymentCardInfo = async (
  payload: Partial<IPaymentCard>,
  userId: string,
) => {
  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not found");
  }

  const existingCardsCount = await PaymentCard.countDocuments({
    userId: userId,
    isDeleted: false
  });

  if (existingCardsCount >= MAX_CARDS_PER_USER) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `You can store a maximum of ${MAX_CARDS_PER_USER} payment cards only`,
    );
  }

  const paymentCard = await PaymentCard.create({
    ...payload,
    userId: userId,
  });

  return paymentCard;
};

const getAllCardInfo = async (userId: string) => {
  const cards = await PaymentCard.find({
    userId: userId,
    isDeleted: false,
  });

  if (!cards.length) {
    throw new AppError(httpStatus.NOT_FOUND, "No payment cards found");
  }

  return cards;
};

const getSingleCardInfo = async (userId: string, cardId: string) => {
  const card = await PaymentCard.findOne({
    userId: userId,
    _id: cardId,
    isDeleted: false,
  });

  if (!card) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment card not found");
  }

  return card;
};

const deleteSingleCardInfo = async (
  userId: string,
  cardId: string,
) => {
  const card = await PaymentCard.findOne({
    userId: userId,
    _id: cardId,
  });

  if (card?.isDeleted)
    throw new AppError(httpStatus.BAD_REQUEST, "Card already deleted");

  if (!card) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment card not found");
  }

  card.isDeleted = true;
  await card.save();

  return null;
};

export const PaymentCardService = {
  storePaymentCardInfo,
  getAllCardInfo,
  getSingleCardInfo,
  deleteSingleCardInfo,
};
