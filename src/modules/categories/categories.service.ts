import { CategoryRepository } from '../../infrastructure/repositories/category.repository';
import { CreateCategoryInput, UpdateCategoryInput } from './categories.types';
import { Category } from '../../domain/entities/category.entity';
import { AppError } from '../../shared/errors/app-error';

export class CategoriesService {
    private categoryRepository: CategoryRepository;

    constructor() {
        this.categoryRepository = new CategoryRepository();
    }

    private generateSlug(name: string): string {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    async createCategory(input: CreateCategoryInput): Promise<Category> {
        const slug = this.generateSlug(input.name);

        // Check for duplicate slug?
        const existing = await this.categoryRepository.findBySlug(slug);
        if (existing) {
            // Append random string or fail? Let's fail for now or simple append
            throw new AppError({ message: 'Category with this name already exists', statusCode: 400 });
        }

        if (input.parentId) {
            const parent = await this.categoryRepository.findById(input.parentId);
            if (!parent) {
                throw new AppError({ message: 'Parent category not found', statusCode: 404 });
            }
        }

        return this.categoryRepository.create({
            name: input.name,
            slug,
            parentId: input.parentId,
        });
    }

    async getCategoriesTree(): Promise<Category[]> {
        const allCategories = await this.categoryRepository.findAll();

        const categoryMap = new Map<string, any>();
        const roots: any[] = [];

        // First pass: create map nodes
        allCategories.forEach(cat => {
            categoryMap.set(cat.id, { ...cat, children: [] });
        });

        // Second pass: link children to parents
        allCategories.forEach(cat => {
            const node = categoryMap.get(cat.id);
            if (cat.parentId) {
                const parent = categoryMap.get(cat.parentId);
                if (parent) {
                    parent.children.push(node);
                } else {
                    // Orphan? Treat as root?
                    roots.push(node);
                }
            } else {
                roots.push(node);
            }
        });

        return roots;
    }

    async updateCategory(id: string, input: UpdateCategoryInput): Promise<Category> {
        const category = await this.categoryRepository.findById(id);
        if (!category) {
            throw new AppError({ message: 'Category not found', statusCode: 404 });
        }

        const data: any = {};
        if (input.name) {
            data.name = input.name;
            data.slug = this.generateSlug(input.name);

            // Check collision
            if (data.slug !== category.slug) {
                const existing = await this.categoryRepository.findBySlug(data.slug);
                if (existing) throw new AppError({ message: 'Category with this name already exists', statusCode: 400 });
            }
        }

        if (input.parentId !== undefined) {
            if (input.parentId === id) {
                throw new AppError({ message: 'Category cannot be its own parent', statusCode: 400 });
            }
            if (input.parentId) {
                const parent = await this.categoryRepository.findById(input.parentId);
                if (!parent) throw new AppError({ message: 'Parent category not found', statusCode: 404 });

                // TODO: Check for circular dependency if needed
            }
            data.parentId = input.parentId;
        }

        return this.categoryRepository.update(id, data);
    }

    async deleteCategory(id: string): Promise<void> {
        const category = await this.categoryRepository.findById(id);
        if (!category) {
            throw new AppError({ message: 'Category not found', statusCode: 404 });
        }

        // Check if it has children?
        // If we delete a parent, what happens to children? 
        // Prisma might handle cascading delete or set null depending on schema. 
        // Our schema allows parentId to be nullable.
        // However, for strict hierarchy, maybe we should prevent deletion if children exist.
        // Let's check children in memory for now using findAll or add a count method.
        // simpler: try delete, if FK fails catch it, or just rely on Prisma.
        // The schema does not specify onDelete behavior, standard SQL is usually NO ACTION or RESTRICT.
        // Let's check if there are subcategories.

        const all = await this.categoryRepository.findAll();
        const hasChildren = all.some(c => c.parentId === id);
        if (hasChildren) {
            throw new AppError({ message: 'Cannot delete category with sub-categories. Delete them first.', statusCode: 400 });
        }

        await this.categoryRepository.delete(id);
    }
}

export const categoriesService = new CategoriesService();
