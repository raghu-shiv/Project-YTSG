import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { AppModule } from "./app.module";
import helmet from "helmet";

async function bootstrap() {
  const logger = new Logger("Bootstrap");

  try {
    const app = await NestFactory.create(AppModule, {
      // Don't crash on initialization errors — log them
      abortOnError: false,
    });

    // Security
    app.use(helmet());

    // CORS — allow known origins only
    const frontendUrl =
      process.env.FRONTEND_URL || "https://www.yt-scripts.online";
    const allowedOrigins = [
      frontendUrl,
      "https://www.yt-scripts.online",
      "https://yt-scripts.online",
      "http://localhost:3000",
      "http://localhost:4000",
    ];

    app.enableCors({
      origin: (origin, callback) => {
        // Allow requests with no origin (server-to-server, curl, etc.)
        if (!origin) return callback(null, true);
        // Allow if matches any allowed origin
        if (
          allowedOrigins.some((o) => origin.includes(o) || origin.startsWith(o))
        ) {
          return callback(null, true);
        }
        // Allow Vercel preview deployments (for dev/staging branches)
        if (origin.includes(".vercel.app")) {
          return callback(null, true);
        }
        // Reject unknown origins in production
        callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
    });

    // Validation
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // Global prefix
    app.setGlobalPrefix("api");

    const port = process.env.PORT || 4000;
    logger.log(`Attempting to bind to port ${port}...`);
    await app.listen(port);
    logger.log(`Backend running on http://localhost:${port}`);
  } catch (error) {
    logger.error("Failed to start application:");
    logger.error(error instanceof Error ? error.stack : error);
    process.exit(1);
  }
}
bootstrap();
