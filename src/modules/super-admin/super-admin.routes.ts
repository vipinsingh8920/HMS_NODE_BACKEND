import { Router } from "express";

import { validateBody,validateParams } from "../../common/validators/validate";
import { loginRateLimiter } from "../../common/middleware/rate-limit";
import {
  authenticate,
  requireSuperAdmin,
} from "../../common/middleware/auth";

import {
  changeSuperAdminPasswordController,
  forgotSuperAdminPasswordController,
  resetSuperAdminPasswordController,
  updateSuperAdminController,
  updateSuperAdminStatusController,
  getSuperAdminProfileController,
  loginSuperAdminController,
  registerSuperAdminController,
} from "./super-admin.controller";

import {
  loginSuperAdminSchema,
  registerSuperAdminSchema,
  changeSuperAdminPasswordSchema,
  forgotSuperAdminPasswordSchema,
  resetSuperAdminPasswordSchema,
  updateSuperAdminSchema,
  updateSuperAdminStatusSchema,
  superAdminIdParamSchema
} from "./super-admin.schema";

const router = Router();

router.post(
  "/register",
  validateBody(registerSuperAdminSchema),
  registerSuperAdminController,
);

router.post(
  "/login",
  loginRateLimiter,
  validateBody(loginSuperAdminSchema),
  loginSuperAdminController,
);
router.get(
  "/me",
  authenticate,
  requireSuperAdmin,
  getSuperAdminProfileController,
);

router.post(
  "/change-password",
  authenticate,
  requireSuperAdmin,
  validateBody(changeSuperAdminPasswordSchema),
  changeSuperAdminPasswordController,
);

router.post(
  "/forgot-password",
  validateBody(forgotSuperAdminPasswordSchema),
  forgotSuperAdminPasswordController,
);

router.post(
  "/reset-password",
  validateBody(resetSuperAdminPasswordSchema),
  resetSuperAdminPasswordController,
);

router.patch(
  "/admins/me",
  authenticate,
  requireSuperAdmin,
  validateBody(updateSuperAdminSchema),
  updateSuperAdminController,
);

router.patch(
  "/admins/:id/status",
  authenticate,
  requireSuperAdmin,
  validateParams(superAdminIdParamSchema),
  validateBody(updateSuperAdminStatusSchema),
  updateSuperAdminStatusController,
);

export { router as superAdminAuthRouter };