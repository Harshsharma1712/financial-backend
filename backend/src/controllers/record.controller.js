import { eq, and, gte, lte, desc } from "drizzle-orm";
import db from "../db/index.js";
import { financialRecords } from "../db/schema/financialRecords.js";
import { categories } from "../db/schema/categories.js";
import { users } from "../db/schema/users.js";
import { ApiError } from "../utils/apiError.js";

/**
 * GET /api/records
 * List records with filtering and pagination
 */
export const getRecords = async (req, res, next) => {
    try {
        const { type, categoryId, startDate, endDate, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        // Build conditions
        const conditions = [];

        // If not admin, restrict to own records (assuming viewer/analyst can only see own, wait, plan says "Viewer, Analyst, Admin -> List records". If they should see ALL or just theirs isn't explicitly detailed aside from "Access insights/analytics". Let's assume Viewer/Analyst can see all records based on "Dashboard Summary & Analytics" seeing all data. BUT, typical finance app restricts to own data unless Admin. Let's make it so viewers/analysts see ALL records per the plan ("Viewer: View financial records - YES").
        
        if (type) conditions.push(eq(financialRecords.type, type));
        if (categoryId) conditions.push(eq(financialRecords.categoryId, parseInt(categoryId)));
        if (startDate) conditions.push(gte(financialRecords.date, startDate));
        if (endDate) conditions.push(lte(financialRecords.date, endDate));

        const queryConditions = conditions.length > 0 ? and(...conditions) : undefined;

        // Get total count
        const allMatching = await db
            .select({ id: financialRecords.id })
            .from(financialRecords)
            .where(queryConditions);
        
        const total = allMatching.length;

        // Get paginated data with joins
        const records = await db
            .select({
                id: financialRecords.id,
                amount: financialRecords.amount,
                type: financialRecords.type,
                date: financialRecords.date,
                notes: financialRecords.notes,
                createdAt: financialRecords.createdAt,
                category: {
                    id: categories.id,
                    name: categories.name,
                },
                user: {
                    id: users.id,
                    name: users.name,
                }
            })
            .from(financialRecords)
            .leftJoin(categories, eq(financialRecords.categoryId, categories.id))
            .leftJoin(users, eq(financialRecords.userId, users.id))
            .where(queryConditions)
            .orderBy(desc(financialRecords.date))
            .limit(limit)
            .offset(offset);

        res.json({
            success: true,
            data: records,
            meta: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/records/:id
 * Get single record
 */
export const getRecord = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);

        const [record] = await db
            .select({
                id: financialRecords.id,
                amount: financialRecords.amount,
                type: financialRecords.type,
                date: financialRecords.date,
                notes: financialRecords.notes,
                createdAt: financialRecords.createdAt,
                category: {
                    id: categories.id,
                    name: categories.name,
                },
                user: {
                    id: users.id,
                    name: users.name,
                }
            })
            .from(financialRecords)
            .leftJoin(categories, eq(financialRecords.categoryId, categories.id))
            .leftJoin(users, eq(financialRecords.userId, users.id))
            .where(eq(financialRecords.id, id));

        if (!record) throw ApiError.notFound("Record not found");

        res.json({ success: true, data: record });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/records
 * Create a record
 */
export const createRecord = async (req, res, next) => {
    try {
        const { amount, type, categoryId, date, notes, userId } = req.body;
        
        // Use provided userId or fallback to authenticated user
        const targetUserId = userId || req.user.userId;

        const [newRecord] = await db
            .insert(financialRecords)
            .values({
                userId: targetUserId,
                amount,
                type,
                categoryId,
                date,
                notes,
            })
            .returning();

        res.status(201).json({
            success: true,
            message: "Record created successfully",
            data: newRecord,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/records/:id
 * Update a record
 */
export const updateRecord = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const updateData = req.body;

        // Ensure not empty
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ success: false, message: "No data to update" });
        }

        updateData.updatedAt = new Date();

        const [updatedRecord] = await db
            .update(financialRecords)
            .set(updateData)
            .where(eq(financialRecords.id, id))
            .returning();

        if (!updatedRecord) throw ApiError.notFound("Record not found");

        res.json({
            success: true,
            message: "Record updated successfully",
            data: updatedRecord,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/records/:id
 * Delete a record
 */
export const deleteRecord = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);

        const [deletedRecord] = await db
            .delete(financialRecords)
            .where(eq(financialRecords.id, id))
            .returning();

        if (!deletedRecord) throw ApiError.notFound("Record not found");

        res.json({
            success: true,
            message: "Record deleted successfully",
            data: deletedRecord,
        });
    } catch (error) {
        next(error);
    }
};
