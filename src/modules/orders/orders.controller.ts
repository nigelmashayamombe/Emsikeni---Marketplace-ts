import { Request, Response } from 'express';
import { OrdersService } from './orders.service';
import { OrderStatus } from '@prisma/client';

const ordersService = new OrdersService();

export class OrdersController {

    // Get all orders for the logged-in seller
    async listSellerOrders(req: Request, res: Response) {
        const sellerId = req.user!.sub;
        const orders = await ordersService.getSellerOrders(sellerId);
        res.json(orders);
    }

    // Get details of a specific order
    async getOrderDetails(req: Request, res: Response) {
        const sellerId = req.user!.sub;
        const orderId = req.params.id;
        const order = await ordersService.getOrderDetails(orderId, sellerId);
        res.json(order);
    }

    // Update order status
    async updateStatus(req: Request, res: Response) {
        const sellerId = req.user!.sub;
        const orderId = req.params.id;
        const { status } = req.body;

        const updatedOrder = await ordersService.updateOrderStatus(orderId, sellerId, status as OrderStatus);
        res.json(updatedOrder);
    }

    // --- Buyer Endpoints ---

    // Place Order
    async placeOrder(req: Request, res: Response) {
        const buyerId = req.user!.sub;
        const { items } = req.body; // items: { productId, quantity }[]
        const orders = await ordersService.createOrder(buyerId, items);
        res.status(201).json(orders);
    }

    // List My Orders
    async listMyOrders(req: Request, res: Response) {
        const buyerId = req.user!.sub;
        const orders = await ordersService.getBuyerOrders(buyerId);
        res.json(orders);
    }

    // Get My Order Details
    async getMyOrder(req: Request, res: Response) {
        const buyerId = req.user!.sub;
        const orderId = req.params.id;
        const order = await ordersService.getBuyerOrderDetails(orderId, buyerId);
        res.json(order);
    }

    // --- Admin Endpoints ---
    async updateStatusAdmin(req: Request, res: Response) {
        const orderId = req.params.id;
        const { status } = req.body;
        const updatedOrder = await ordersService.updateOrderStatusAdmin(orderId, status as OrderStatus);
        res.json(updatedOrder);
    }
}

export const ordersController = new OrdersController();
