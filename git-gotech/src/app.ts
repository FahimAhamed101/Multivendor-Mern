import cors, { CorsOptions } from "cors";
import dotenv from "dotenv";
import express, { Application, NextFunction, Request, Response } from "express";
import { notFound } from "./middlewares/notFound";
import router from "./routes";
import { logger, errorLogger, logHttpRequests } from "./logger/logger";
import { template } from "./rootTemplate";
import { PaymentController } from "./modules/payment/payment.controller";
import globalErrorHandler from "./middlewares/globalErrorHandler";

dotenv.config();

const app: Application = express();

const envAllowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:3002",
  "http://10.10.11.118:3001",
  "http://10.10.11.118:3040",
  "https://multivendor-mern.vercel.app",
  "https://manage.sleeknit.com",
  "https://sleeknit.com",
  ...envAllowedOrigins,
];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
};

// ✅ CORS FIRST
app.use(cors(corsOptions));

// ✅ Handle preflight
app.options("*", cors(corsOptions));

// Logs & parsers
app.use(logHttpRequests);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Momo Web Hook
app.use("/webhook/momo", PaymentController.momoWebhook);

// Static & routes
app.use(express.static("public"));
app.use(router);

app.get("/", (req: Request, res: Response) => {
  logger.info("Root endpoint hit 🌐 :");
  res.status(200).send(template);
});

// Log errors
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  errorLogger.error(`Error occurred: ${err.message}`, { stack: err.stack });
  next(err);
});

app.use(notFound);
app.use(globalErrorHandler);

export default app;
