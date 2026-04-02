import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiError.js";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_dev_secret";

/**
 * Authentication middleware.
 * Verifies the JWT from the Authorization header and attaches
 * `req.user = { userId, roles }` to the request object.
 */
export const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw ApiError.unauthorized("Access token is missing");
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        req.user = {
            userId: decoded.userId,
            roles: decoded.roles || [],
        };

        next();
    } catch (error) {
        if (error instanceof ApiError) {
            return next(error);
        }
        if (error.name === "JsonWebTokenError") {
            return next(ApiError.unauthorized("Invalid token"));
        }
        if (error.name === "TokenExpiredError") {
            return next(ApiError.unauthorized("Token has expired"));
        }
        next(ApiError.unauthorized("Authentication failed"));
    }
};
