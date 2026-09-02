import { Router } from "express";

import {
  authenticate,
  requireSuperAdmin,
} from "../../common/middleware/auth";

import {
  validateBody,
  validateParams,
} from "../../common/validators/validate";

import {
  updateSuperAdminController,
  updateSuperAdminStatusController,
} from "./super-admin.controller";

import {
  updateSuperAdminSchema,
  updateSuperAdminStatusSchema,
  superAdminIdParamSchema,
} from "./super-admin.schema";

const router = Router();

router.patch(
  "/me",
  authenticate,
  requireSuperAdmin,
  validateBody(updateSuperAdminSchema),
  updateSuperAdminController,
);

router.patch(
  "/:id/status",
  authenticate,
  requireSuperAdmin,
  validateParams(superAdminIdParamSchema),
  validateBody(updateSuperAdminStatusSchema),
  updateSuperAdminStatusController,
);

export { router as superAdminAdminRouter };