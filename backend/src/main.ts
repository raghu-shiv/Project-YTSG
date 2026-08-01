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

    // CORS
    app.enableCors({
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
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