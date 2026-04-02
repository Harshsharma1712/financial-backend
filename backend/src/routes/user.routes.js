import { Router } from "express";
import {
    getUsers,
    getUser,
    updateUser,
    deleteUser,
    assignRole,
    revokeRole,
} from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/roleGuard.js";
import { validate } from "../middleware/validate.js";
import { userUpdateSchema, assignRoleSchema } from "../validations/schemas.js";

const router = Router();

// Apply auth and admin check to all user routes
router.use(authenticate, requireRole("admin"));

// GET /api/users
router.get("/", getUsers);

// GET /api/users/:id
router.get("/:id", getUser);

// PUT /api/users/:id
router.put("/:id", validate(userUpdateSchema), updateUser);

// DELETE /api/users/:id
router.delete("/:id", deleteUser);

// POST /api/users/:id/roles
router.post("/:id/roles", validate(assignRoleSchema), assignRole);

// DELETE /api/users/:id/roles/:roleId
router.delete("/:id/roles/:roleId", revokeRole);

export default router;
