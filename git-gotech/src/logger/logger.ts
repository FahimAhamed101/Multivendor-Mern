import path from "path";
import DailyRotateFile from "winston-daily-rotate-file";
import { createLogger, format, transports } from "winston";
import { Request, Response, NextFunction } from "express";
import chalk from "chalk";

const { combine, timestamp, label, printf, errors, splat } = format;

// Common text format used for files
const customFileFormat = printf((info) => {
  const { level, message, label, timestamp, stack, ...meta } = info;
  const date = new Date(timestamp as string);
  const hour = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  const metaData = Object.keys(meta).length ? JSON.stringify(meta) : "";
  const errorMessage = stack ? `\n${stack}` : "";

  return `${date.toDateString()} ${hour}:${minutes}:${seconds} [${label}] ${level.toUpperCase()}: ${message} ${metaData} ${errorMessage}`;
});

// Vibrant console format styled with Chalk
const customConsoleFormat = printf((info) => {
  const { level, message, label, timestamp, stack, ...meta } = info;
  const date = new Date(timestamp as string);
  const hour = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  const metaData = Object.keys(meta).length ? chalk.cyan(`\nMetadata: ${JSON.stringify(meta, null, 2)}`) : "";
  const errorMessage = stack ? chalk.red(`\n${stack}`) : "";

  const timeStr = chalk.gray(`${date.toDateString()} ${hour}:${minutes}:${seconds}`);
  const labelStr = chalk.magenta.bold(`[${label}]`);
  
  // Format the level
  let levelStr = level.toUpperCase();
  if (level.includes("info")) levelStr = chalk.green.bold(levelStr);
  if (level.includes("warn")) levelStr = chalk.yellow.bold(levelStr);
  if (level.includes("error")) levelStr = chalk.red.bold(levelStr);

  return `${timeStr} ${labelStr} ${levelStr}: ${chalk.whiteBright(message)} ${metaData} ${errorMessage}`;
});

// Info & General Logger
export const logger = createLogger({
  level: "info",
  format: combine(
    label({ label: "GoTech-Server" }),
    timestamp(),
    errors({ stack: true }), // captures stack traces
    splat()
  ),
  transports: [
    new transports.Console({
      format: customConsoleFormat,
    }),
    new DailyRotateFile({
      filename: path.join(process.cwd(), "winston", "success", "%DATE%-success.log"),
      datePattern: "DD-MM-YYYY-HH",
      maxSize: "20m",
      maxFiles: "14d",
      format: customFileFormat
    }),
  ],
});

// Error Specific Logger
export const errorLogger = createLogger({
  level: "error",
  format: combine(
    label({ label: "GoTech-Server" }),
    timestamp(),
    errors({ stack: true }), // captures stack traces
    splat()
  ),
  transports: [
    new transports.Console({
      format: customConsoleFormat,
    }),
    new DailyRotateFile({
      filename: path.join(process.cwd(), "winston", "error", "%DATE%-error.log"),
      datePattern: "DD-MM-YYYY-HH",
      maxSize: "20m",
      maxFiles: "14d",
      format: customFileFormat
    }),
  ],
});

// Advanced HTTP request logger middleware
export const logHttpRequests = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();

  res.on("finish", () => {
    const colorizeByStatusCode = (statusCode: number) => {
      if (statusCode >= 200 && statusCode < 300) return chalk.green.bold(`${statusCode} 🎉`);
      if (statusCode >= 400 && statusCode < 500) return chalk.red.bold(`${statusCode} ⚠️`);
      if (statusCode >= 500) return chalk.bgRed.white.bold(` ${statusCode} 🔥 `);
      return chalk.blue.bold(`${statusCode} ❗`);
    };

    const colorizeByMethod = (method: string) => {
      switch (method) {
        case "GET": return chalk.greenBright(`${method} 🔍`);
        case "POST": return chalk.cyanBright(`${method} ✏️`);
        case "PATCH": return chalk.yellowBright(`${method} ✨`);
        case "PUT": return chalk.yellow(`${method} 🛠️`);
        case "DELETE": return chalk.redBright(`${method} ❌`);
        default: return chalk.magenta(`${method} Unknown 😢`);
      }
    };

    const clientIp = req.ip
      ? req.ip.startsWith("::ffff:")
        ? req.ip.substring(7)
        : req.ip
      : "Unknown IP";

    const responseTime = Date.now() - startTime;
    const timeColor = responseTime > 500 ? chalk.red : responseTime > 150 ? chalk.yellow : chalk.green;
    
    const logMessage = `🖥️ IP: ${chalk.cyan(clientIp)} 🌐 ${colorizeByMethod(req.method)} ${colorizeByStatusCode(res.statusCode)} ${chalk.magentaBright.bold(req.originalUrl)} ⏱️ Response Time: ${timeColor(`${responseTime} ms`)}`;

    if (res.statusCode >= 400) {
      errorLogger.error(logMessage, { size: res.get("Content-Length") || 0 });
    } else {
      logger.info(logMessage, { size: res.get("Content-Length") || 0 });
    }
  });

  next();
};
