import { Router } from "express";

import { superAdminAuthRouter } from "./modules/super-admin/super-admin.routes";
import { superAdminAdminRouter } from "./modules/super-admin/super-admin-admin.routes";

const router = Router();

router.use(
  "/super-admin/auth",
  superAdminAuthRouter,
);

router.use(
  "/super-admin/admins",
  superAdminAdminRouter,
);

export { router };