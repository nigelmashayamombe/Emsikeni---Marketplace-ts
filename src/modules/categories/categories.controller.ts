import { Request, Response } from 'express';
import { categoriesService } from './categories.service';
import { CreateCategoryInput, UpdateCategoryInput } from './categories.types';

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category management
 */

class CategoriesController {
    /**
     * @swagger
     * /categories:
     *   post:
     *     summary: Create a new category
     *     tags: [Categories]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - name
     *             properties:
     *               name:
     *                 type: string
     *               parentId:
     *                 type: string
     *                 format: uuid
     *     responses:
     *       201:
     *         description: Category created successfully
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden
     */
    async create(req: Request<{}, {}, CreateCategoryInput>, res: Response) {
        const category = await categoriesService.createCategory(req.body);
        res.status(201).json(category);
    }

    /**
     * @swagger
     * /categories:
     *   get:
     *     summary: Get all categories (hierarchical)
     *     tags: [Categories]
     *     responses:
     *       200:
     *         description: List of categories
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Category'
     */
    async getAll(_req: Request, res: Response) {
        const categories = await categoriesService.getCategoriesTree();
        res.json(categories);
    }

    /**
     * @swagger
     * /categories/{id}:
     *   put:
     *     summary: Update a category
     *     tags: [Categories]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *           format: uuid
     *         required: true
     *         description: Category ID
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *               parentId:
     *                 type: string
     *                 format: uuid
     *                 nullable: true
     *     responses:
     *       200:
     *         description: Category updated successfully
     *       404:
     *         description: Category not found
     */
    async update(
        req: Request<{ id: string }, {}, UpdateCategoryInput>,
        res: Response,
    ) {
        const category = await categoriesService.updateCategory(
            req.params.id,
            req.body,
        );
        res.json(category);
    }

    /**
     * @swagger
     * /categories/{id}:
     *   delete:
     *     summary: Delete a category
     *     tags: [Categories]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *           format: uuid
     *         required: true
     *         description: Category ID
     *     responses:
     *       204:
     *         description: Category deleted successfully
     *       400:
     *         description: Cannot delete category with children
     *       404:
     *         description: Category not found
     */
    async delete(req: Request<{ id: string }>, res: Response) {
        await categoriesService.deleteCategory(req.params.id);
        res.status(204).send();
    }
}

export const categoriesController = new CategoriesController();
