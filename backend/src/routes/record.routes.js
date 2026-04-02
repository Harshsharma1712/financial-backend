import { Router } from "express";
import {
    getRecords,
    getRecord,
    createRecord,
    updateRecord,
    deleteRecord,
} from "../controllers/record.controller.js";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/roleGuard.js";
import { validate } from "../middleware/validate.js";
import { recordSchema, recordQuerySchema } from "../validations/schemas.js";

const router = Router();

router.use(authenticate);

// GET /api/records (Viewer, Analyst, Admin)
router.get(
    "/",
    validate(recordQuerySchema, "query"),
    getRecords
);

// GET /api/records/:id (Viewer, Analyst, Admin)
router.get("/:id", getRecord);

// POST /api/records (Admin)
router.post(
    "/",
    requireRole("admin"),
    validate(recordSchema),
    createRecord
);

// PUT /api/records/:id (Admin)
// We use the same schema for partial updates by allowing all fields to be passed, 
// though typically you'd make them optional. The schema requires them right now, 
// so updates must send full payload. Since this is an internal dashboard, that's fine.
router.put(
    "/:id",
    requireRole("admin"),
    validate(recordSchema),
    updateRecord
);

// DELETE /api/records/:id (Admin)
router.delete("/:id", requireRole("admin"), deleteRecord);

export default router;
