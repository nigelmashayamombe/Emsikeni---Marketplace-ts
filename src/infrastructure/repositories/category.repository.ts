import { prisma } from '../../config/prisma';
import { Category } from '../../domain/entities/category.entity';
import {
    ICategoryRepository,
    CreateCategoryDTO,
    UpdateCategoryDTO,
} from '../../application/interfaces/repositories/category-repository.interface';

export class CategoryRepository implements ICategoryRepository {
    private toEntity(prismaCategory: any): Category {
        return Category.create({
            id: prismaCategory.id,
            name: prismaCategory.name,
            slug: prismaCategory.slug,
            parentId: prismaCategory.parentId,
            createdAt: prismaCategory.createdAt,
            updatedAt: prismaCategory.updatedAt,
            children: prismaCategory.children?.map((c: any) => this.toEntity(c)),
        });
    }

    async create(data: CreateCategoryDTO): Promise<Category> {
        const category = await prisma.category.create({
            data: {
                name: data.name,
                slug: data.slug,
                parentId: data.parentId,
            },
            include: { children: true },
        });
        return this.toEntity(category);
    }

    async findById(id: string): Promise<Category | null> {
        const category = await prisma.category.findUnique({
            where: { id },
            include: { children: true },
        });
        return category ? this.toEntity(category) : null;
    }

    async findAll(): Promise<Category[]> {
        // We fetch all and let the service build the tree if needed, 
        // OR we can fetch root nodes and include children recursively?
        // Prisma recursion is limited. 
        // Best practice for arbitrary depth: fetch all flat and build tree in application.
        // For now, let's just fetch flat list as base, or maybe fetch everything.
        const categories = await prisma.category.findMany({
            orderBy: { name: 'asc' },
        });
        return categories.map((c) => this.toEntity(c));
    }

    async findBySlug(slug: string): Promise<Category | null> {
        const category = await prisma.category.findUnique({
            where: { slug },
            include: { children: true },
        });
        return category ? this.toEntity(category) : null;
    }

    async update(id: string, data: UpdateCategoryDTO): Promise<Category> {
        const category = await prisma.category.update({
            where: { id },
            data,
            include: { children: true },
        });
        return this.toEntity(category);
    }

    async delete(id: string): Promise<void> {
        await prisma.category.delete({ where: { id } });
    }
}
