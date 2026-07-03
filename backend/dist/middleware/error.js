"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
class AppError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
exports.AppError = AppError;
const errorHandler = (err, _req, res, _next) => {
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    const message = err.message || "Internal Server Error";
    if (process.env.NODE_ENV !== "production") {
        console.error(err);
    }
    res.status(statusCode).json({
        success: false,
        message,
    });
};
exports.errorHandler = errorHandler;
