"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const validate = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                message: "Validation error",
                errors: result.error.issues.map((issue) => ({
                    path: issue.path.join("."),
                    message: issue.message,
                })),
            });
        }
        req.body = result.data;
        next();
    };
};
exports.validate = validate;
