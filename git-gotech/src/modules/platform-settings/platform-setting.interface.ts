import { Types } from 'mongoose';

interface IPlatformSetting {
  _id: Types.ObjectId;
  perKgWeightPrice: number;
  perKmDistancePrice: number;
  driverWithdrawPercentage: number;
  vendorWithdrawPercentage: number;
  customerWithdrawPercentage: number;
}

export default IPlatformSetting;