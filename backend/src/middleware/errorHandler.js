import { ApiError } from "../utils/apiError.js";

export const errorHandler = (err, req, res, next) => {
    // Log error for debugging
    console.error(`[ERROR] ${err.name}: ${err.message}`);

    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
    }

    // Drizzle / DB errors
    if (err.code === "23505") {
        return res.status(409).json({
            success: false,
            message: "A record with that value already exists",
        });
    }

    if (err.code === "23503") {
        return res.status(400).json({
            success: false,
            message: "Referenced record does not exist",
        });
    }

    // Fallback for unexpected errors
    return res.status(500).json({
        success: false,
        message: "Internal server error",
    });
};
