import mongoose, { Schema } from 'mongoose';
import IPlatformSetting from './platform-setting.interface';

const schema = new Schema<IPlatformSetting>(
  {
    perKgWeightPrice: {
      type: Number,
      required: [true, 'Per kg weight price is required'],
    },
    perKmDistancePrice: {
      type: Number,
      required: [true, 'Per km distance price is required'],
    },
    driverWithdrawPercentage: {
      type: Number,
      required: [true, 'Driver withdraw percentage is required'],
    },
    vendorWithdrawPercentage: {
      type: Number,
      required: [true, 'Vendor withdraw percentage is required'],
    },
    customerWithdrawPercentage: {
      type: Number,
      required: [true, 'Customer withdraw percentage is required'],
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const PlatformSetting = mongoose.model<IPlatformSetting>('PlatformSetting', schema);
export default PlatformSetting;