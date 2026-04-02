import { ApiError } from "../utils/apiError.js";

/**
 * Role-based authorization middleware factory.
 * @param  {...string} allowedRoles - Roles that are permitted (e.g., "admin", "analyst")
 * @returns Express middleware
 *
 * Usage: router.get("/admin-only", authenticate, requireRole("admin"), handler)
 */
export const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.roles) {
            return next(ApiError.unauthorized("Authentication required"));
        }

        const hasRole = req.user.roles.some((role) =>
            allowedRoles.includes(role)
        );

        if (!hasRole) {
            return next(
                ApiError.forbidden(
                    `Access denied. Required role: ${allowedRoles.join(" or ")}`
                )
            );
        }

        next();
    };
};
