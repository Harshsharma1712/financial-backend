import { ApiError } from "../utils/apiError.js";

/**
 * Creates a validation middleware using a Zod schema.
 * @param {import("zod").ZodSchema} schema - Zod schema to validate against
 * @param {"body" | "query" | "params"} source - Which part of the request to validate
 */
export const validate = (schema, source = "body") => {
    return (req, res, next) => {
        const result = schema.safeParse(req[source]);

        if (!result.success) {
            const errors = result.error.errors.map((e) => ({
                field: e.path.join("."),
                message: e.message,
            }));

            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors,
            });
        }

        // Replace with parsed (and coerced) data
        req[source] = result.data;
        next();
    };
};
