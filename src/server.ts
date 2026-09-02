import { app } from "./app";
import { env } from "./config/env";
import {
  connectDatabase,
  disconnectDatabase,
} from "./config/database";
import { logger } from "./config/logger";

async function startServer(): Promise<void> {
  try {
    await connectDatabase();

    logger.info("Database connected successfully");

    const server = app.listen(env.PORT, () => {
      logger.info(
        {
          port: env.PORT,
          environment: env.NODE_ENV,
        },
        "HMS API server started",
      );
    });

    const shutdown = async (signal: string): Promise<void> => {
      logger.info({ signal }, "Shutdown signal received");

      server.close(async () => {
        logger.info("HTTP server closed");

        await disconnectDatabase();

        logger.info("Database connection closed");

        process.exit(0);
      });
    };

    process.on("SIGTERM", () => {
      void shutdown("SIGTERM");
    });

    process.on("SIGINT", () => {
      void shutdown("SIGINT");
    });
  } catch (error) {
    logger.error({ error }, "Failed to start HMS API");

    await disconnectDatabase();

    process.exit(1);
  }
}

void startServer();