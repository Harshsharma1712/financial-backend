import { Router } from "express";
import { signup, login } from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.js";
import { signupSchema, loginSchema } from "../validations/schemas.js";

const router = Router();

// POST /api/auth/signup
router.post("/signup", validate(signupSchema), signup);

// POST /api/auth/login
router.post("/login", validate(loginSchema), login);

export default router;
