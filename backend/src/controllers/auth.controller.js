import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import db from "../db/index.js";
import { users } from "../db/schema/users.js";
import { roles } from "../db/schema/roles.js";
import { userRoles } from "../db/schema/userRoles.js";
import { ApiError } from "../utils/apiError.js";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_dev_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// Helper: get user's role names
async function getUserRoles(userId) {
    const result = await db
        .select({ roleName: roles.name })
        .from(userRoles)
        .innerJoin(roles, eq(userRoles.roleId, roles.id))
        .where(eq(userRoles.userId, userId));

    return result.map((r) => r.roleName);
}

// Helper: generate JWT
function generateToken(userId, roleNames) {
    return jwt.sign({ userId, roles: roleNames }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
}

/**
 * POST /api/auth/signup
 */
export const signup = async (req, res, next) => {
    try {
        const { name, email, password, role = "viewer" } = req.body;

        // Check if user already exists
        const existing = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.email, email));

        if (existing.length > 0) {
            throw ApiError.conflict("A user with this email already exists");
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const [newUser] = await db
            .insert(users)
            .values({ name, email, password: hashedPassword })
            .returning({ id: users.id, name: users.name, email: users.email });

        // Assign requested or default role
        const [targetRole] = await db
            .select({ id: roles.id })
            .from(roles)
            .where(eq(roles.name, role));

        if (targetRole) {
            await db
                .insert(userRoles)
                .values({ userId: newUser.id, roleId: targetRole.id });
        }

        // Generate token
        const token = generateToken(newUser.id, [role]);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                user: newUser,
                roles: [role],
                token,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email));

        if (!user) {
            throw ApiError.unauthorized("Invalid email or password");
        }

        // Check if user is active
        if (user.status !== "active") {
            throw ApiError.forbidden("Your account has been deactivated");
        }

        // Compare password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            throw ApiError.unauthorized("Invalid email or password");
        }

        // Get roles
        const roleNames = await getUserRoles(user.id);

        // Generate token
        const token = generateToken(user.id, roleNames);

        res.json({
            success: true,
            message: "Login successful",
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    status: user.status,
                },
                roles: roleNames,
                token,
            },
        });
    } catch (error) {
        next(error);
    }
};
