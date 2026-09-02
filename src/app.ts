import { errorHandler } from "./common/errors/error-handler";
import express from "express";
import compression from "compression";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";

import { env } from "./config/env";
import { logger } from "./config/logger";
import { notFoundHandler } from "./common/middleware/not-found";
import { router } from "./routes";

const app = express();

app.disable("x-powered-by");

app.use(
  pinoHttp({
    logger,
  }),
);

app.use(
  helmet(),
);

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);

app.use(compression());

app.use(
  express.json({
    limit: "1mb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  }),
);

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "HMS API is healthy",
  });
});

app.use("/api/v1", router);

app.use(notFoundHandler);
app.use(errorHandler);

export { app };