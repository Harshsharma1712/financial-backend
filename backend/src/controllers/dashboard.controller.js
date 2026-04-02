import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import db from "../db/index.js";
import { financialRecords } from "../db/schema/financialRecords.js";
import { categories } from "../db/schema/categories.js";

// Helper for date filtering
const getDateFilter = (startDate, endDate) => {
    const conditions = [];
    if (startDate) conditions.push(gte(financialRecords.date, startDate));
    if (endDate) conditions.push(lte(financialRecords.date, endDate));
    return conditions.length > 0 ? and(...conditions) : undefined;
};

/**
 * GET /api/dashboard/summary
 * Total income, expenses, and net balance
 */
export const getSummary = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const whereClause = getDateFilter(startDate, endDate);

        // Calculate totals using aggregation natively in Drizzle for PG
        const result = await db
            .select({
                type: financialRecords.type,
                total: sql`sum(${financialRecords.amount})`.mapWith(Number),
            })
            .from(financialRecords)
            .where(whereClause)
            .groupBy(financialRecords.type);

        let income = 0;
        let expense = 0;

        result.forEach((row) => {
            if (row.type === "income") income = row.total;
            if (row.type === "expense") expense = row.total;
        });

        res.json({
            success: true,
            data: {
                income,
                expense,
                balance: income - expense,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/dashboard/category-summary
 * Totals grouped by category
 */
export const getCategorySummary = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const whereClause = getDateFilter(startDate, endDate);

        const summaries = await db
            .select({
                categoryId: financialRecords.categoryId,
                categoryName: categories.name,
                type: financialRecords.type,
                total: sql`sum(${financialRecords.amount})`.mapWith(Number),
            })
            .from(financialRecords)
            .leftJoin(categories, eq(financialRecords.categoryId, categories.id))
            .where(whereClause)
            .groupBy(financialRecords.categoryId, categories.name, financialRecords.type);

        res.json({ success: true, data: summaries });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/dashboard/trends
 * Monthly income/expense trends
 */
export const getTrends = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const whereClause = getDateFilter(startDate, endDate);

        const trends = await db
            .select({
                month: sql`date_trunc('month', ${financialRecords.date})`.mapWith(String),
                type: financialRecords.type,
                total: sql`sum(${financialRecords.amount})`.mapWith(Number),
            })
            .from(financialRecords)
            .where(whereClause)
            .groupBy(sql`1`, financialRecords.type) // groupBy position 1 (month)
            .orderBy(sql`1`);

        // Format for cleaner consumption by UI (grouping by month)
        const formattedTrends = {};
        
        trends.forEach((t) => {
            const key = t.month.substring(0, 7); // extract YYYY-MM
            if (!formattedTrends[key]) {
                formattedTrends[key] = { month: key, income: 0, expense: 0 };
            }
            if (t.type === "income") formattedTrends[key].income = t.total;
            if (t.type === "expense") formattedTrends[key].expense = t.total;
        });

        res.json({ success: true, data: Object.values(formattedTrends) });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/dashboard/recent
 * Last N transactions
 */
export const getRecent = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 5;

        const recent = await db
            .select({
                id: financialRecords.id,
                amount: financialRecords.amount,
                type: financialRecords.type,
                date: financialRecords.date,
                notes: financialRecords.notes,
                category: {
                    id: categories.id,
                    name: categories.name,
                },
            })
            .from(financialRecords)
            .leftJoin(categories, eq(financialRecords.categoryId, categories.id))
            .orderBy(desc(financialRecords.date))
            .limit(limit);

        res.json({ success: true, data: recent });
    } catch (error) {
        next(error);
    }
};
