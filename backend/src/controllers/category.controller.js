import db from "../db/index.js";
import { categories } from "../db/schema/categories.js";
import { eq } from "drizzle-orm";
import { ApiError } from "../utils/apiError.js";

/**
 * GET /api/categories
 * List all categories
 */
export const getCategories = async (req, res, next) => {
    try {
        const allCategories = await db.select().from(categories);
        res.json({ success: true, data: allCategories });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/categories
 * Create a new category
 */
export const createCategory = async (req, res, next) => {
    try {
        const { name } = req.body;

        const [newCategory] = await db
            .insert(categories)
            .values({ name })
            .returning();

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: newCategory,
        });
    } catch (error) {
        if (error.code === "23505") { // duplicate key
            return next(ApiError.conflict("A category with this name already exists"));
        }
        next(error);
    }
};

/**
 * DELETE /api/categories/:id
 * Delete a category
 */
export const deleteCategory = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        
        const [deletedCategory] = await db
            .delete(categories)
            .where(eq(categories.id, id))
            .returning();

        if (!deletedCategory) {
            throw ApiError.notFound("Category not found");
        }

        res.json({
            success: true,
            message: "Category deleted successfully",
            data: deletedCategory,
        });
    } catch (error) {
        next(error);
    }
};
