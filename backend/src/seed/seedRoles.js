import db from "../db/index.js";
import { roles } from "../db/schema/roles.js";

const defaultRoles = [
    { name: "viewer", description: "Can only view dashboard data" },
    { name: "analyst", description: "Can view records and access insights" },
    { name: "admin", description: "Can create, update, and manage records and users" },
];

export async function seedRoles() {
    try {
        for (const role of defaultRoles) {
            // Insert only if the role doesn't already exist
            await db
                .insert(roles)
                .values(role)
                .onConflictDoNothing({ target: roles.name });
        }
        console.log("[SEED] Default roles seeded successfully");
    } catch (error) {
        console.error("[SEED] Error seeding roles:", error.message);
    }
}
