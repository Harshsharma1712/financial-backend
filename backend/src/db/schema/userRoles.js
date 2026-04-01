import { pgTable, serial, integer } from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { roles } from "./roles.js";

export const userRoles = pgTable("user_roles", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
    roleId: integer("role_id").references(() => roles.id, { onDelete: "cascade" }),
});