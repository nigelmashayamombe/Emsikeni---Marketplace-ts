import { PrismaClient, Product, ProductStatus } from '@prisma/client';
import { AppError } from '../../shared/errors/app-error';

const prisma = new PrismaClient();

export class InventoryService {
    async adjustStock(userId: string, productId: string, adjustment: number) {
        const product = await this.getProductForUpdate(userId, productId);

        const newQuantity = product.quantity + adjustment;
        if (newQuantity < 0) {
            throw new AppError({ message: 'Insufficient stock for this operation', statusCode: 400 });
        }

        return this.updateProductStock(product, newQuantity);
    }

    async setStock(userId: string, productId: string, quantity: number) {
        const product = await this.getProductForUpdate(userId, productId);
        return this.updateProductStock(product, quantity);
    }

    async updateLowStockThreshold(userId: string, productId: string, threshold: number) {
        const product = await this.getProductForUpdate(userId, productId);

        return prisma.product.update({
            where: { id: productId },
            data: { lowStockThreshold: threshold },
        });
    }

    async getLowStockProducts(userId: string, userRole?: string) {
        // Seller sees their own low stock products.
        // Admin could seeing all? Let's assume this is for Sellers' dashboard mostly.

        // If Admin, maybe see all?
        const where: any = {
            deletedAt: null,
            // quantity <= lowStockThreshold is not directly supported in simple where clause in all prisma versions easily without raw query or computed column,
            // but Prisma recently supports field comparisons in `where` in newer versions?
            // Actually standard filtering: quantity: { lte: user_input } is easy. But comparing two columns (quantity <= lowStockThreshold) is harder in standard Prisma API without raw query or extensions.
            // 
            // Workaround: Get all products for seller, then filter in memory?
            // Or use queryRaw.
            // Let's try in-memory for now if list is small, or raw query for performance.
            // Given "Marketplace", product list might be large.
            // Let's use logic:
            // fetch products where quantity is low.

            // Since `lowStockThreshold` is per product now (as added to schema), we can't do `where: { quantity: { lte: 5 } }` globally if threshold varies.
            // 
            // Let's use `findMany` and filter in memory for now, assuming pagination would be needed later.
            // To optimize, we can use `where: { sellerId: userId }` to limit scope.

        };

        if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
            where.sellerId = userId;
        }

        // Since we can't easily do "where quantity <= lowStockThreshold" in standard Prisma `findMany` without raw where:
        // We will fetch all non-deleted products for the user and filter.
        // This is not performant for millions of items, but acceptable for MVP.
        // Optimization: Add a boolean flag `isLowStock` computed on write?
        // Or just use raw query.
        // Let's use in-memory filter for simplicity and type safety now.

        const products = await prisma.product.findMany({
            where,
            select: {
                id: true,
                name: true,
                quantity: true,
                lowStockThreshold: true,
                status: true,
                images: true,
                price: true,
                category: { select: { name: true } }
            }
        });

        return products.filter(p => p.quantity <= p.lowStockThreshold);
    }

    private async getProductForUpdate(userId: string, productId: string) {
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            throw new AppError({ message: 'Product not found', statusCode: 404 });
        }

        if (product.sellerId !== userId) {
            // Assume only owner can change stock. Admin?
            // Let's allow Admin too if needed, but requirements imply Seller manages inventory.
            // For simplicity, strict ownership for now.
            // If we want admin, we'd pass role and check.
            throw new AppError({ message: 'Unauthorized to update inventory for this product', statusCode: 403 });
        }

        if (product.deletedAt) {
            throw new AppError({ message: 'Product is deleted', statusCode: 400 });
        }

        return product;
    }

    private async updateProductStock(product: Product, newQuantity: number) {
        let newStatus = product.status;

        // Automatic Status Change logic
        if (newQuantity === 0) {
            if (product.status === ProductStatus.APPROVED) {
                newStatus = ProductStatus.OUT_OF_STOCK;
            }
        } else {
            // Stock added
            if (product.status === ProductStatus.OUT_OF_STOCK) {
                newStatus = ProductStatus.APPROVED;
            }
        }

        return prisma.product.update({
            where: { id: product.id },
            data: {
                quantity: newQuantity,
                status: newStatus,
            },
        });
    }
}
