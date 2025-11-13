import { ZodError } from "zod";

export const validate =
    (schemas = {}) =>
    (req, res, next) => {
        try {
            if (schemas.body) req.body = schemas.body.parse(req.body);
            if (schemas.query) req.query = schemas.query.parse(req.query);
            if (schemas.params) req.params = schemas.params.parse(req.params);
            return next();
        } catch (err) {
            if (err instanceof ZodError) {
                return res.status(400).json({
                    errors: err.issues.map((i) => ({
                        path: i.path,
                        code: i.code,
                        message: i.message,
                    })),
                });
            }
            return res.status(500).json({ message: "Internal error" });
        }
    };
