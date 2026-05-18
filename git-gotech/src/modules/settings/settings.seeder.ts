
import { logger } from "../../logger/logger";
import PlatformSetting from "../platform-settings/platform-setting.model";
import Setting from "./settings.model";
import colors from "colors";

const SettingSeeder = async () => {
  const settingsData = [
    {
      key: "privacy-policy",
      value: "Hi this is privacy-policy",
    },
    {
      key: "terms-conditions",
      value: "This is terms data",
    },
    {
      key: "about-us",
      value: "this is about us",
    },
    {
      key: "support",
      value: {
        details: "details data is here..........",
        phone: "5246543254145",
        email: "support@gitgotech.com",
        email2: "support@gitgotech.com",
      },
    },
    {
      key: "radius-limits",
      value: {
        min: 1,
        max: 100,
      },
    },
  ];

  // Create bulk operations: upsert each setting by key
  const bulkOps = settingsData.map((setting) => ({
    updateOne: {
      filter: { key: setting.key },
      update: { $setOnInsert: setting }, // If a setting with the same key already exists, nothing is updated because $setOnInsert only applies on insert.
      upsert: true,
    },
  }));

  // Execute bulkWrite to insert if not exists
  await Setting.bulkWrite(bulkOps);

  // 1. Prepare the data to match your schema fields exactly
  const platformSettingsData = {
    perKgWeightPrice: 2,
    perKmDistancePrice: 2,
    driverWithdrawPercentage: 10,
    vendorWithdrawPercentage: 10,
    customerWithdrawPercentage: 10,
  };

  // 2. Perform a single upsert
  // We use an empty filter {} because we only want ONE settings document in the collection
  await PlatformSetting.findOneAndUpdate(
    {},
    { $setOnInsert: platformSettingsData },
    {
      upsert: true,
      new: true,
      runValidators: true
    }
  );

  logger.info(
    colors.green("Settings seeded (inserted if missing) successfully")
  );
};

export default SettingSeeder;
