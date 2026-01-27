import { Request, Response } from 'express';
import { InventoryService } from './inventory.service';
import { adjustStockSchema, setStockSchema, updateLowStockThresholdSchema } from './inventory.schema';
import { AppError } from '../../shared/errors/app-error';

const inventoryService = new InventoryService();

export class InventoryController {

    async adjustStock(req: Request, res: Response) {
        const productId = req.params.id;
        const userId = req.user!.sub; // Auth middleware ensures this

        const result = adjustStockSchema.safeParse(req);
        if (!result.success) {
            throw new AppError({ message: 'Invalid input', details: result.error.format() });
        }

        const { adjustment } = result.data.body;

        const updatedProduct = await inventoryService.adjustStock(userId, productId, adjustment);
        res.json(updatedProduct);
    }

    async setStock(req: Request, res: Response) {
        const productId = req.params.id;
        const userId = req.user!.sub;

        const result = setStockSchema.safeParse(req);
        if (!result.success) {
            throw new AppError({ message: 'Invalid input', details: result.error.format() });
        }

        const { quantity } = result.data.body;

        const updatedProduct = await inventoryService.setStock(userId, productId, quantity);
        res.json(updatedProduct);
    }

    async updateLowStockThreshold(req: Request, res: Response) {
        const productId = req.params.id;
        const userId = req.user!.sub;

        const result = updateLowStockThresholdSchema.safeParse(req);
        if (!result.success) {
            throw new AppError({ message: 'Invalid input', details: result.error.format() });
        }

        const { threshold } = result.data.body;

        const updatedProduct = await inventoryService.updateLowStockThreshold(userId, productId, threshold);
        res.json(updatedProduct);
    }

    async getLowStockProducts(req: Request, res: Response) {
        const userId = req.user!.sub;
        const userRole = req.user!.role;

        // Use a custom service method to find low stock items
        // This isn't just about iterating, 
        // it's about querying effectively or filtering.
        // Service handles logic.

        // We expect service to return array of products.
        // But since getLowStockProducts logic in service returns array of Promises? No, wait.
        // My service implementation:
        /*
        async getLowStockProducts(userId: string, userRole?: string) {
           ...
           const products = await prisma.product.findMany(...)
           return products.filter(...)
        }
        */
        // Returns Product[] (Promise).

        const lowStockProducts = await inventoryService.getLowStockProducts(userId, userRole);
        res.json(lowStockProducts);
    }
}

export const inventoryController = new InventoryController();
