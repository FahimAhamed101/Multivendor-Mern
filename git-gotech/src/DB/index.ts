import { ADMIN_EMAIL, ADMIN_PASSWORD } from "../config";
import { logger } from "../logger/logger";
import { UserModel } from "../modules/user/user.model";
import { hashPassword } from "../modules/user/user.utils";

const admin = {
  name: "admin",
  username: "admin",
  email: ADMIN_EMAIL,
  password: ADMIN_PASSWORD,
  role: "admin",
  isVerified: true,
  isDeleted: false,
};

export const seedSuperAdmin = async () => {
  const admins = [admin];

  for (const adminData of admins) {
    const isAdminExists = await UserModel.findOne({ email: adminData.email });

    if (!isAdminExists) {
      const hashedPassword = await hashPassword(adminData.password as string);
      const adminWithHashedPassword = {
        ...adminData,
        password: hashedPassword,
      };

      await UserModel.create(adminWithHashedPassword);
      logger.info(`Admin created: ${adminData.email}`);
    } else {
      logger.info(`Admin already exists: ${adminData.email}`);
    }
  }
};

export default seedSuperAdmin;
