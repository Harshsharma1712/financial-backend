import { z } from "zod";

// ─── Auth Schemas ────────────────────────────────────

export const signupSchema = z.object({
    name: z.string().min(1, "Name is required").max(100),
    email: z.string().email("Invalid email address").max(150),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

// ─── User Management Schemas ─────────────────────────

export const userUpdateSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    email: z.string().email().max(150).optional(),
    status: z.enum(["active", "inactive"]).optional(),
});

export const assignRoleSchema = z.object({
    roleId: z.coerce.number().positive(),
});

// ─── Category Schemas ────────────────────────────────

export const categorySchema = z.object({
    name: z.string().min(1, "Category name is required").max(100),
});

// ─── Financial Record Schemas ────────────────────────

export const recordSchema = z.object({
    userId: z.coerce.number().positive().optional(), // Can be set by admin for other users, otherwise inferred from auth
    amount: z.coerce.number().positive("Amount must be positive"),
    type: z.enum(["income", "expense"]),
    categoryId: z.coerce.number().positive(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format"),
    notes: z.string().optional(),
});

export const recordQuerySchema = z.object({
    type: z.enum(["income", "expense"]).optional(),
    categoryId: z.coerce.number().positive().optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    page: z.coerce.number().positive().default(1),
    limit: z.coerce.number().positive().max(100).default(20),
});

// ─── Dashboard Schemas ───────────────────────────────

export const dashboardQuerySchema = z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});
