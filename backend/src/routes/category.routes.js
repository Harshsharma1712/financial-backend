import { Router } from "express";
import { getCategories, createCategory, deleteCategory } from "../controllers/category.controller.js";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/roleGuard.js";
import { validate } from "../middleware/validate.js";
import { categorySchema } from "../validations/schemas.js";

const router = Router();

// GET /api/categories (Any authenticated)
router.get("/", authenticate, getCategories);

// POST /api/categories (Admin)
router.post(
    "/",
    authenticate,
    requireRole("admin"),
    validate(categorySchema),
    createCategory
);

// DELETE /api/categories/:id (Admin)
router.delete("/:id", authenticate, requireRole("admin"), deleteCategory);

export default router;
