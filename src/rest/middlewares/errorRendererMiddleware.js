import z, {ZodError} from "zod";
import {AppError, BadRequest, Internal} from "../../core/errors/errors.js";

export async function errorRendererMiddleware(
    err,
    req,
    res,
    next
) {
    if (err instanceof ZodError) {
        const details = z.treeifyError(err);
        const e = new BadRequest("Validation failed", details);
        return res.status(e.status).json({
            error: e.code,
            message: e.message,
            details: e.details,
        });
    }

    if (err instanceof AppError) {
        return res.status(err.status).json({
            error: err.code,
            message: err.message,
            details: err.details,
        });
    }

    console.error("Unexpected error:", err);
    const e = new Internal();
    return res.status(e.status).json({
        error: e.code,
        message: e.message,
    });
}