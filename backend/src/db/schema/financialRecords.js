import {
    pgTable,
    serial,
    integer,
    decimal,
    varchar,
    text,
    date,
    timestamp,
} from "drizzle-orm/pg-core";

import { users } from "./users.js";
import { categories } from "./categories.js";

export const financialRecords = pgTable("financial_records", {
    id: serial("id").primaryKey(),

    userId: integer("user_id")
        .references(() => users.id, { onDelete: "cascade" }),

    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),

    type: varchar("type", { length: 10 }).notNull(), // income/expense

    categoryId: integer("category_id")
        .references(() => categories.id),

    date: date("date").notNull(),

    notes: text("notes"),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});