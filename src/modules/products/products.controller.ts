import { Request, Response } from 'express';
import { ProductsService } from './products.service';
import { LocalFileStorageService } from '../../infrastructure/services/local-file-storage.service';

const productsService = new ProductsService();
const storageService = new LocalFileStorageService();

export class ProductsController {

    // Create Product
    async create(req: Request, res: Response) {
        // req.user is guaranteed by authMiddleware
        const sellerId = req.user!.sub;

        const files = req.files as Express.Multer.File[];
        const imageUrls: string[] = [];

        if (files && files.length > 0) {
            for (const file of files) {
                const url = await storageService.save({
                    buffer: file.buffer,
                    mimeType: file.mimetype
                });
                imageUrls.push(url);
            }
        }

        const finalImages = [...(req.body.images || []), ...imageUrls];
        const productData = {
            ...req.body,
            images: finalImages
        };

        const product = await productsService.createProduct(sellerId, productData);
        res.status(201).json(product);
    }

    // Update Product
    // Update Product
    async update(req: Request, res: Response) {
        const sellerId = req.user!.sub; // Only seller can update their product logic in service
        const productId = req.params.id;

        const files = req.files as Express.Multer.File[];
        const imageUrls: string[] = [];

        if (files && files.length > 0) {
            for (const file of files) {
                const url = await storageService.save({
                    buffer: file.buffer,
                    mimeType: file.mimetype
                });
                imageUrls.push(url);
            }
        }

        let finalImages = req.body.images;
        if (imageUrls.length > 0) {
            finalImages = [...(finalImages || []), ...imageUrls];
        }

        const productData = { ...req.body };
        if (finalImages) {
            productData.images = finalImages;
        }

        const product = await productsService.updateProduct(sellerId, productId, productData);
        res.status(200).json(product);
    }

    // Delete Product (Soft delete)
    async delete(req: Request, res: Response) {
        const sellerId = req.user!.sub;
        const productId = req.params.id;
        await productsService.deleteProduct(sellerId, productId);
        res.status(204).send();
    }

    // Get Single Product Public
    async getOne(req: Request, res: Response) {
        // Fallback or legacy if needed, or just remove. 
        // Since generic route uses getPublic, we can remove this.
        // But let's just make it alias getPublic to be safe if I missed a route.
        return productsController.getPublic(req, res);
    }

    // Actually, I'll implement `getOne` relying on Public access first (Approved only).
    // And `getOnePrivate` for protected access if needed, or just let `getOne` be smart if I can.
    // I'll stick to: Public Routes (Approved Only) + Protected Management Routes.
    // How does a Seller see their DRAFT? 
    // Maybe `GET /my-products` list?
    // And `GET /my-products/:id`?
    // I'll implement `get` (public) and `getMyProduct` (protected).

    async getPublic(req: Request, res: Response) {
        const productId = req.params.id;
        const product = await productsService.getProduct(productId); // no role -> public -> Approved only
        res.json(product);
    }

    async listPublic(req: Request, res: Response) {
        const filters = req.query;
        const products = await productsService.getProducts(filters);
        res.json(products);
    }

    // Protected
    async getMyProduct(req: Request, res: Response) {
        const product = await productsService.getProduct(req.params.id, req.user?.role, req.user?.sub);
        res.json(product);
    }

    async listMyProducts(req: Request, res: Response) {
        const filters = { ...req.query, sellerId: req.user!.sub };
        const products = await productsService.getProducts(filters, req.user?.role, req.user?.sub);
        res.json(products);
    }

    // Admin Review
    async review(req: Request, res: Response) {
        const productId = req.params.id;
        const result = await productsService.reviewProduct(productId, req.body);
        res.json(result);
    }
}

export const productsController = new ProductsController();
