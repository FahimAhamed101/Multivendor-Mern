import { createServer, Server as HttpServer } from "http";
import { initSocketIO } from "./utils/socket";
import mongoose from "mongoose";
import app from "./app"; // Express app
import { DATABASE_URL, PORT } from "./config";
import seedSuperAdmin from "./DB"; // Seeding function
import SettingSeeder from "./modules/settings/settings.seeder";
import { logger, errorLogger } from "./logger/logger";

let server: HttpServer;

async function main() {
  try {
    const dbStartTime = Date.now();
    // Connect to MongoDB with a timeout
    await mongoose.connect(DATABASE_URL as string, {
      connectTimeoutMS: 10000, // 10 second timeout
    });
    logger.info(
      `✅ Mongodb connected successfully in ${Date.now() - dbStartTime}ms`
    );

    // Start HTTP server
    server = createServer(app);
    const serverStartTime = Date.now();
    server.listen(PORT, () => {
      logger.info(
        `🚀 Server is running on port ${PORT} and take ${Date.now() - serverStartTime}ms to start!`
      );
    });

    // Initialize Socket.IO
    initSocketIO(server);
    // Start seeding in parallel after the server has started
    await Promise.all([
      seedSuperAdmin(),
      SettingSeeder()
    ]);
  } catch (error) {
    errorLogger.error("Error in main function:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  errorLogger.error("☠️ Unhandled error in main:", error);
  process.exit(1);
});

// Gracefully handle unhandled rejections and uncaught exceptions
process.on("unhandledRejection", (err) => {
  errorLogger.error(" ☠️ Unhandled promise rejection detected:", err);
  server.close(() => process.exit(1));
});
//no comment
process.on("uncaughtException", (error) => {
  errorLogger.error("☠️ Uncaught exception detected:", error);
  server.close(() => process.exit(1));
});
