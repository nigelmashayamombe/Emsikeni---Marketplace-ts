import multer from 'multer';
import { AppError } from '../shared/errors/app-error';

const storage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new AppError({ message: 'Invalid file type. Only JPEG, PNG and WEBP allowed', statusCode: 400 }) as any, false);
    }
};

export const productUploadMiddleware = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
}).array('images', 5); // Allow up to 5 images in 'images' field
