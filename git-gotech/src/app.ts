import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import { notFound } from "./middlewares/notFound";
import router from "./routes";
import { logger, errorLogger, logHttpRequests } from "./logger/logger";
import { template } from "./rootTemplate";
import { PaymentController } from "./modules/payment/payment.controller";
import globalErrorHandler from "./middlewares/globalErrorHandler";

const app: Application = express();

// ✅ CORS FIRST
app.use(
  cors({
    origin: [
      "http://10.10.11.118:3001",
      "http://10.10.11.118:3040",
      "https://manage.sleeknit.com",
      "https://sleeknit.com"
    ],
    credentials: true,
  })
);

// ✅ Handle preflight
app.options("*", cors());

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
