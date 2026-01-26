import { PrismaClient, Product, ProductStatus } from '@prisma/client';
import { AppError } from '../../shared/errors/app-error';
import { CreateProductInput, UpdateProductInput, ReviewProductInput } from './products.schema';

const prisma = new PrismaClient(); // Ideally should be injected or imported from a shared db module

export class ProductsService {
    async createProduct(sellerId: string, data: CreateProductInput) {
        // Validate category exists and is a leaf (optional but good practice)
        const category = await prisma.category.findUnique({
            where: { id: data.categoryId },
            include: { children: true },
        });

        if (!category) {
            throw new AppError({ message: 'Category not found', statusCode: 404 });
        }

        if (category.children.length > 0) {
            throw new AppError({ message: 'Cannot assign product to a parent category. Please select a sub-category.', statusCode: 400 });
        }

        const product = await prisma.product.create({
            data: {
                ...data,
                sellerId,
                status: data.status || ProductStatus.DRAFT,
            },
        });

        return product;
    }

    async updateProduct(sellerId: string, productId: string, data: UpdateProductInput) {
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            throw new AppError({ message: 'Product not found', statusCode: 404 });
        }

        if (product.sellerId !== sellerId) {
            throw new AppError({ message: 'Unauthorized to update this product', statusCode: 403 });
        }

        if (product.deletedAt) {
            throw new AppError({ message: 'Product is deleted', statusCode: 400 });
        }

        // If status is currently APPROVED and we are updating key fields, should we revert to PENDING?
        // User request: "Changes trigger re-review"
        // Let's enforce: If modifying name, description, price, logic -> PENDING_REVIEW if it was APPROVED
        // Or simpler: any update sets it to PENDING_REVIEW if it was APPROVED.

        let newStatus = product.status;
        let rejectionReason = product.rejectionReason;

        if (product.status === ProductStatus.APPROVED || product.status === ProductStatus.REJECTED) {
            // If currently Approved or Rejected, move back to Pending Review on meaningful edit
            // We'll trust the input status if provided, otherwise default logic
            if (!data.status) {
                newStatus = ProductStatus.PENDING_REVIEW;
            }
            // If user provided status, usage of schema prevents setting to APPROVED directly (only Draft/Pending)
        }

        // If user explicitly sets status (e.g. back to DRAFT), respect that.
        if (data.status) {
            newStatus = data.status;
        }

        // Reset rejection reason on update
        rejectionReason = null;

        const updatedProduct = await prisma.product.update({
            where: { id: productId },
            data: {
                ...data,
                status: newStatus,
                rejectionReason: rejectionReason,
            },
        });

        return updatedProduct;
    }

    async deleteProduct(sellerId: string, productId: string) {
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            throw new AppError({ message: 'Product not found', statusCode: 404 });
        }

        if (product.sellerId !== sellerId) {
            throw new AppError({ message: 'Unauthorized to delete this product', statusCode: 403 });
        }

        return prisma.product.update({
            where: { id: productId },
            data: { deletedAt: new Date() } // Soft delete
        });
    }

    async getProduct(productId: string, userRole?: string, userId?: string) {
        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: { seller: { select: { id: true, fullName: true, email: true } }, category: true }
        });

        if (!product || product.deletedAt) {
            throw new AppError({ message: 'Product not found', statusCode: 404 });
        }

        // Rules:
        // Admin: View all
        // Seller: View own
        // Public/Buyer: View APPROVED only

        const isOwner = userId === product.sellerId;
        const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';

        if (!isAdmin && !isOwner && product.status !== ProductStatus.APPROVED) {
            throw new AppError({ message: 'Product not available', statusCode: 404 }); // Hide non-approved from public
        }

        return product;
    }

    async getProducts(filters: any, userRole?: string, userId?: string) {
        // Basic listing logic
        const where: any = {
            deletedAt: null,
        };

        const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';

        // If Seller requests their own products? 
        // NOTE: User didn't specify distinct "My Products" vs "Marketplace" endpoint, 
        // but usually sellers want to see their own.
        // Let's assume this is a general listing.
        // If public/buyer -> Status APPROVED
        // If Admin -> All
        // If Seller -> All? No, seller sees "Marketplace" (Approved) OR "My Products" (All theirs).

        // Let's implementing filtering.
        if (filters.sellerId) {
            where.sellerId = filters.sellerId;
            // If viewing specific seller, and it's ME, show all. Else show Approved.
            if (userId !== filters.sellerId && !isAdmin) {
                where.status = ProductStatus.APPROVED;
            }
        } else {
            // General marketplace listing
            if (!isAdmin) {
                where.status = ProductStatus.APPROVED;
            }
        }

        if (filters.categoryId) {
            where.categoryId = filters.categoryId;
        }

        // Optional: status filter (for Admin or Owner)
        if (filters.status && (isAdmin || filters.sellerId === userId)) {
            where.status = filters.status;
        }

        const products = await prisma.product.findMany({
            where,
            include: {
                category: true,
                seller: { select: { id: true, fullName: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return products;
    }

    async reviewProduct(productId: string, data: ReviewProductInput) {
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) throw new AppError({ message: "Product not found", statusCode: 404 });

        // Admin logic is usually handled by controller role check

        return prisma.product.update({
            where: { id: productId },
            data: {
                status: data.status,
                rejectionReason: data.rejectionReason
            }
        });
    }
}
