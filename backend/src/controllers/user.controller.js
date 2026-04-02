import { eq, and } from "drizzle-orm";
import db from "../db/index.js";
import { users } from "../db/schema/users.js";
import { roles } from "../db/schema/roles.js";
import { userRoles } from "../db/schema/userRoles.js";
import { ApiError } from "../utils/apiError.js";

// Helper to get roles for all users
async function getUsersWithRoles() {
    const allUsers = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        status: users.status,
        createdAt: users.createdAt,
    }).from(users);

    const allUserRoles = await db
        .select({
            userId: userRoles.userId,
            roleName: roles.name,
        })
        .from(userRoles)
        .innerJoin(roles, eq(userRoles.roleId, roles.id));

    // Map roles to users
    const usersMap = allUsers.reduce((acc, user) => {
        acc[user.id] = { ...user, roles: [] };
        return acc;
    }, {});

    allUserRoles.forEach((ur) => {
        if (usersMap[ur.userId]) {
            usersMap[ur.userId].roles.push(ur.roleName);
        }
    });

    return Object.values(usersMap);
}

/**
 * GET /api/users
 * List all users with their roles
 */
export const getUsers = async (req, res, next) => {
    try {
        const usersList = await getUsersWithRoles();
        res.json({ success: true, data: usersList });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/users/:id
 * Get single user
 */
export const getUser = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);

        const [user] = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                status: users.status,
                createdAt: users.createdAt,
            })
            .from(users)
            .where(eq(users.id, id));

        if (!user) throw ApiError.notFound("User not found");

        // get roles
        const userRoleRecords = await db
            .select({ roleName: roles.name })
            .from(userRoles)
            .innerJoin(roles, eq(userRoles.roleId, roles.id))
            .where(eq(userRoles.userId, id));

        user.roles = userRoleRecords.map((r) => r.roleName);

        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/users/:id
 * Update user details or status
 */
export const updateUser = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const { name, email, status } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (status) updateData.status = status;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ success: false, message: "No data provided to update" });
        }

        const [updatedUser] = await db
            .update(users)
            .set(updateData)
            .where(eq(users.id, id))
            .returning({
                id: users.id,
                name: users.name,
                email: users.email,
                status: users.status,
            });

        if (!updatedUser) throw ApiError.notFound("User not found");

        res.json({ success: true, message: "User updated", data: updatedUser });
    } catch (error) {
        if (error.code === "23505") { // duplicate email
            return next(ApiError.conflict("Email already in use by another user"));
        }
        next(error);
    }
};

/**
 * DELETE /api/users/:id
 * Delete a user
 */
export const deleteUser = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);

        const [deletedUser] = await db
            .delete(users)
            .where(eq(users.id, id))
            .returning({ id: users.id });

        if (!deletedUser) throw ApiError.notFound("User not found");

        res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/users/:id/roles
 * Assign a role to user
 */
export const assignRole = async (req, res, next) => {
    try {
        const userId = parseInt(req.params.id);
        const { roleId } = req.body;

        // check if user exists
        const [userExists] = await db.select({ id: users.id }).from(users).where(eq(users.id, userId));
        if (!userExists) throw ApiError.notFound("User not found");

        // check if role exists
        const [roleExists] = await db.select({ id: roles.id }).from(roles).where(eq(roles.id, roleId));
        if (!roleExists) throw ApiError.notFound("Role not found");

        try {
            await db.insert(userRoles).values({ userId, roleId });
            res.json({ success: true, message: "Role assigned successfully" });
        } catch (error) {
            if (error.code === "23505") { // User already has this role (if composite key logic was enforced, but let's be safe regardless)
                return next(ApiError.conflict("User already has this role"));
            }
            throw error;
        }
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/users/:id/roles/:roleId
 * Remove role from user
 */
export const revokeRole = async (req, res, next) => {
    try {
        const userId = parseInt(req.params.id);
        const roleId = parseInt(req.params.roleId);

        const [deletedRole] = await db
            .delete(userRoles)
            .where(
                and(
                    eq(userRoles.userId, userId),
                    eq(userRoles.roleId, roleId)
                )
            )
            .returning();

        if (!deletedRole) {
            return res.status(404).json({ success: false, message: "User does not have this role" });
        }

        res.json({ success: true, message: "Role revoked successfully" });
    } catch (error) {
        next(error);
    }
};
