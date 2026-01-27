import { Router } from 'express';
import { inventoryController } from './inventory.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

// Apply auth middleware to all inventory routes
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Inventory management APIs
 */

/**
 * @swagger
 * /inventory/{id}/adjustment:
 *   post:
 *     summary: Adjust stock level (increment/decrement)
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               adjustment:
 *                 type: integer
 *                 description: Amount to add (positive) or subtract (negative)
 *                 example: 10
 *     responses:
 *       200:
 *         description: Stock adjusted
 *       400:
 *         description: Insufficient stock or invalid input
 *       404:
 *         description: Product not found
 *       403:
 *         description: Unauthorized
 */
router.post('/inventory/:id/adjustment', inventoryController.adjustStock.bind(inventoryController));

/**
 * @swagger
 * /inventory/{id}/stock:
 *   put:
 *     summary: Set absolute stock level
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 0
 *                 description: New quantity
 *                 example: 50
 *     responses:
 *       200:
 *         description: Stock updated
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Product not found
 *       403:
 *         description: Unauthorized
 */
router.put('/inventory/:id/stock', inventoryController.setStock.bind(inventoryController));

/**
 * @swagger
 * /inventory/{id}/low-stock-threshold:
 *   put:
 *     summary: Update low stock threshold for a product
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               threshold:
 *                 type: integer
 *                 minimum: 0
 *                 description: New threshold value
 *                 example: 5
 *     responses:
 *       200:
 *         description: Threshold updated
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Product not found
 *       403:
 *         description: Unauthorized
 */
router.put('/inventory/:id/low-stock-threshold', inventoryController.updateLowStockThreshold.bind(inventoryController));

/**
 * @swagger
 * /inventory/low-stock:
 *   get:
 *     summary: Get products with low stock
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of low stock products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product' 
 */
router.get('/inventory/low-stock', inventoryController.getLowStockProducts.bind(inventoryController));

export { router as inventoryRouter };
