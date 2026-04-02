import { Router } from "express";
import {
    getSummary,
    getCategorySummary,
    getTrends,
    getRecent,
} from "../controllers/dashboard.controller.js";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/roleGuard.js";
import { validate } from "../middleware/validate.js";
import { dashboardQuerySchema } from "../validations/schemas.js";

const router = Router();

router.use(authenticate);

// Applying query validation to all summary/trend routes
const validateQuery = validate(dashboardQuerySchema, "query");

// GET /api/dashboard/summary (Viewer, Analyst, Admin)
router.get("/summary", validateQuery, getSummary);

// GET /api/dashboard/category-summary (Viewer, Analyst, Admin)
router.get("/category-summary", validateQuery, getCategorySummary);

// GET /api/dashboard/recent (Viewer, Analyst, Admin) 
router.get("/recent", getRecent); // no date validation basically needed for recent

// GET /api/dashboard/trends (Analyst, Admin) -> as per implementation plan requirements!
router.get(
    "/trends",
    requireRole("analyst", "admin"),
    validateQuery,
    getTrends
);

export default router;
