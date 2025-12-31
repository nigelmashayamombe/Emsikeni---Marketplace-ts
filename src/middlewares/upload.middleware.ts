import multer from 'multer';
import { AppError } from '../shared/errors/app-error';

const storage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new AppError({ message: 'Invalid file type. Only JPEG, PNG and PDF allowed', statusCode: 400 }) as any, false);
    }
};

export const uploadMiddleware = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
}).fields([
    { name: 'nationalId', maxCount: 1 },
    { name: 'proofOfResidence', maxCount: 1 },
    { name: 'profilePicture', maxCount: 1 },
    { name: 'driverLicense', maxCount: 1 },
    { name: 'vehicleDocument', maxCount: 1 },
]);
