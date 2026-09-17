"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const auth_1 = require("../middleware/auth");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const uploadDir = path_1.default.resolve(process.cwd(), 'uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, uniqueName);
    }
});
const fileFilter = (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Only image files (JPEG, PNG, WebP, GIF, SVG) are allowed'));
    }
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 5
    }
});
router.post('/', auth_1.auth, (0, auth_1.roles)(client_1.Role.ADMIN, client_1.Role.STOCK_MANAGER), (req, res, next) => {
    upload.array('images', 5)(req, res, (err) => {
        if (err) {
            if (err instanceof multer_1.default.MulterError) {
                if (err.code === 'LIMIT_FILE_COUNT') {
                    return res.status(400).json({ success: false, message: 'You can upload a maximum of 5 pictures.' });
                }
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({ success: false, message: 'File size exceeds 10MB limit.' });
                }
            }
            return res.status(400).json({ success: false, message: err.message || 'Upload error' });
        }
        const files = req.files || [];
        if (files.length === 0) {
            return res.status(400).json({ success: false, message: 'No image files uploaded' });
        }
        const host = req.get('host');
        const protocol = req.protocol;
        const urls = files.map(f => `${protocol}://${host}/uploads/${f.filename}`);
        return res.json({
            success: true,
            message: `${files.length} images uploaded successfully`,
            data: { urls }
        });
    });
});
exports.default = router;
