import { pgTable, serial, varchar, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 150 }).unique().notNull(),
    password: text("password").notNull(),
    status: varchar("status", { length: 20 }).default("active"),
    createdAt: timestamp("created_at").defaultNow(),
});