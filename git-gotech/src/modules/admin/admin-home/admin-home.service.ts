import { UserModel } from "../../user/user.model";
import { Product } from "../../product/product.model";
import { Orders } from "../../orders/orders.model";
import { CustomOrders } from "../../orders/customOrders.model";
import { WithdrawRequest } from "../../withdraw/withdraw.model";
import { WithdrawStatus } from "../../withdraw/withdraw.interface";
import mongoose from "mongoose";

const getAdminDashboardStats = async () => {
  const totalUsers = await UserModel.countDocuments({ isDeleted: false, role: "customer" });
  const totalVendors = await UserModel.countDocuments({ isDeleted: false, role: "vendor" });
  const totalProducts = await Product.countDocuments({ isDeleted: false });

  // Total Revenue from WithdrawRequest platformFee
  const revenueResult = await WithdrawRequest.aggregate([
    { $match: { status: WithdrawStatus.APPROVED } },
    { $group: { _id: null, total: { $sum: "$platformFee" } } },
  ]);

  const totalRevenue = revenueResult[0]?.total || 0;

  const totalCustomVendorCompleteOrder = await CustomOrders.countDocuments({ orderStatus: "Delivered" });

  const pendingOrdersCount = await Orders.countDocuments({ orderStatus: "Pending" });
  const pendingCustomOrdersCount = await CustomOrders.countDocuments({ orderStatus: "Order Placed" });
  const totalPendingOrders = pendingOrdersCount + pendingCustomOrdersCount;

  return {
    totalUsers,
    totalRevenue,
    totalVendors,
    totalProducts,
    totalCustomVendorCompleteOrder,
    pendingOrder: totalPendingOrders,
  };
};

const getYearlyRevenue = async (year: number) => {
  const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
  const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);

  const revenueMonthly = await WithdrawRequest.aggregate([
    {
      $match: {
        status: WithdrawStatus.APPROVED,
        createdAt: { $gte: startOfYear, $lte: endOfYear },
      },
    },
    {
      $group: {
        _id: { month: { $month: "$createdAt" } },
        totalRevenue: { $sum: "$platformFee" },
      },
    },
    { $sort: { "_id.month": 1 } },
  ]);

  const monthlyRevenue: Record<string, number> = {
    January: 0, February: 0, March: 0, April: 0, May: 0, June: 0,
    July: 0, August: 0, September: 0, October: 0, November: 0, December: 0
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  revenueMonthly.forEach(item => {
    monthlyRevenue[monthNames[item._id.month - 1]] = item.totalRevenue;
  });

  return Object.keys(monthlyRevenue).map(month => ({
    month,
    revenue: monthlyRevenue[month]
  }));
};

const getUserVendorRatio = async (year: number, month: number) => {
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

  const ratioData = await UserModel.aggregate([
    {
      $match: {
        isDeleted: false,
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        role: { $in: ["customer", "vendor"] }
      }
    },
    {
      $group: {
        _id: "$role",
        count: { $sum: 1 }
      }
    }
  ]);

  const result = {
    user: 0,
    vendor: 0
  };

  ratioData.forEach(item => {
    if (item._id === "customer") result.user = item.count;
    if (item._id === "vendor") result.vendor = item.count;
  });

  return result;
};

const getRecentUsers = async (limit: number = 10) => {
  return await UserModel.find({ isDeleted: false, role: "customer" })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("name username email image createdAt");
};

const getRecentVendors = async (limit: number = 10) => {
  return await UserModel.find({ isDeleted: false, role: "vendor" })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("name username email image createdAt");
};

export const AdminHomeService = {
  getAdminDashboardStats,
  getYearlyRevenue,
  getUserVendorRatio,
  getRecentUsers,
  getRecentVendors,
};
