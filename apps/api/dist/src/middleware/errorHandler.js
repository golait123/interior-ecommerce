"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    console.error(err.stack || err.message);
    if (err.name === 'ZodError') {
        return res.status(422).json({ success: false, message: 'Validation failed', errors: err.issues });
    }
    if (err.message && (err.message.includes('Insufficient stock') || err.message.includes('unavailable'))) {
        return res.status(409).json({ success: false, message: err.message });
    }
    const status = err.statusCode || 400;
    res.status(status).json({ success: false, message: err.message || 'Request failed' });
};
exports.errorHandler = errorHandler;
