import { PrismaClient, OrderStatus, Order, OrderItem } from '@prisma/client';
import { AppError } from '../../shared/errors/app-error';

const prisma = new PrismaClient();

export class OrdersService {

    /**
     * Get all orders for a specific seller.
     * Orders are where the sellerId matches the user. 
     * NOTE: The current schema has `sellerId` on the Order model.
     * However, an Order might contain items from multiple sellers in a real marketplace?
     * Let's check the schema I just added.
     * 
     * `sellerId String` on Order model.
     * This implies an Order is strictly between one Buyer and one Seller.
     * If a cart has items from multiple sellers, it would likely be split into multiple Orders.
     * This is a safe assumption for now based on the schema I wrote.
     */
    async getSellerOrders(sellerId: string) {
        return prisma.order.findMany({
            where: {
                sellerId: sellerId
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                buyer: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        phone: true,
                        address: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    /**
     * Get a specific order detailed view
     */
    async getOrderDetails(orderId: string, sellerId: string) {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                buyer: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        phone: true,
                        address: true
                    }
                }
            }
        });

        if (!order) {
            throw new AppError({ message: 'Order not found', statusCode: 404 });
        }

        if (order.sellerId !== sellerId) {
            throw new AppError({ message: 'Unauthorized to view this order', statusCode: 403 });
        }

        return order;
    }

    /**
     * Update order status.
     * Rule: Seller cannot change payment state.
     * Rule: Seller marks items ready for warehouse (which implies changing OrderStatus).
     */
    async updateOrderStatus(orderId: string, sellerId: string, status: OrderStatus) {
        const order = await prisma.order.findUnique({
            where: { id: orderId }
        });

        if (!order) {
            throw new AppError({ message: 'Order not found', statusCode: 404 });
        }

        if (order.sellerId !== sellerId) {
            throw new AppError({ message: 'Unauthorized to update this order', statusCode: 403 });
        }

        // Simple state transition validation could go here if needed.
        // For now, allowing jump between any states as per requirement "Seller marks items ready for warehouse"

        return prisma.order.update({
            where: { id: orderId },
            data: {
                status: status
            }
        });
    }

    /**
     * Create generic order(s) for a buyer.
     * Handles splitting orders by seller if items are from different sellers.
     */
    async createOrder(buyerId: string, items: { productId: string; quantity: number }[]) {
        // 1. Fetch all products to get prices and sellerIds
        const productIds = items.map(i => i.productId);
        const products = await prisma.product.findMany({
            where: { id: { in: productIds } }
        });

        // Validate all products exist
        if (products.length !== items.length) {
            throw new AppError({ message: 'One or more products not found', statusCode: 400 });
        }

        // Map for quick lookup
        const productMap = new Map(products.map(p => [p.id, p]));

        // 2. Group items by seller
        const ordersBySeller = new Map<string, { productId: string; quantity: number; price: any }[]>();

        for (const item of items) {
            const product = productMap.get(item.productId)!;

            // basic stock check
            if (product.quantity < item.quantity) {
                throw new AppError({
                    message: `Insufficient stock for product: ${product.name}`,
                    statusCode: 400
                });
            }

            const sellerId = product.sellerId;
            if (!ordersBySeller.has(sellerId)) {
                ordersBySeller.set(sellerId, []);
            }
            ordersBySeller.get(sellerId)!.push({
                productId: item.productId,
                quantity: item.quantity,
                price: product.price
            });
        }

        // 3. Create generic order transactions
        // We use a transaction to ensure all orders are created or none.
        return prisma.$transaction(async (tx) => {
            const createdOrders = [];

            for (const [sellerId, sellerItems] of ordersBySeller.entries()) {
                // Calculate total
                const totalAmount = sellerItems.reduce((sum, item) => {
                    return sum + (Number(item.price) * item.quantity);
                }, 0);

                // Create Order
                // Create Items separately or nested. Nested is cleaner.

                // Decrement Stock first (or inside transaction it handles concurrency better if we use isolation levels, but simple decrement is fine for now)
                for (const item of sellerItems) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: {
                            quantity: { decrement: item.quantity }
                        }
                    });
                }

                const order = await tx.order.create({
                    data: {
                        buyerId: buyerId,
                        sellerId: sellerId,
                        totalAmount: totalAmount,
                        status: 'NEW', // Default
                        paymentStatus: 'PENDING', // Default
                        items: {
                            create: sellerItems.map(item => ({
                                productId: item.productId,
                                quantity: item.quantity,
                                price: item.price
                            }))
                        }
                    },
                    include: {
                        items: true
                    }
                });

                createdOrders.push(order);
            }

            return createdOrders;
        });
    }

    /**
     * Get all orders for a specific buyer.
     */
    async getBuyerOrders(buyerId: string) {
        return prisma.order.findMany({
            where: {
                buyerId: buyerId
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                seller: {
                    select: {
                        id: true,
                        fullName: true,
                        // Business name if it existed, falling back to name
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    /**
     * Get a specific order detailed view for buyer
     */
    async getBuyerOrderDetails(orderId: string, buyerId: string) {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                seller: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        phone: true,
                    }
                }
            }
        });

        if (!order) {
            throw new AppError({ message: 'Order not found', statusCode: 404 });
        }

        if (order.buyerId !== buyerId) {
            throw new AppError({ message: 'Unauthorized to view this order', statusCode: 403 });
        }

        return order;
    }

    /**
     * Admin: Update order status.
     * Bypasses sellerId check.
     */
    async updateOrderStatusAdmin(orderId: string, status: OrderStatus) {
        const order = await prisma.order.findUnique({
            where: { id: orderId }
        });

        if (!order) {
            throw new AppError({ message: 'Order not found', statusCode: 404 });
        }

        return prisma.order.update({
            where: { id: orderId },
            data: {
                status: status
            }
        });
    }
}
