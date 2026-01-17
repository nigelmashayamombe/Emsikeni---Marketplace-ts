import { Category } from '../../../domain/entities/category.entity';

export interface CreateCategoryDTO {
    name: string;
    slug: string;
    parentId?: string | null;
}

export interface UpdateCategoryDTO {
    name?: string;
    slug?: string;
    parentId?: string | null;
}

export interface ICategoryRepository {
    create(data: CreateCategoryDTO): Promise<Category>;
    findById(id: string): Promise<Category | null>;
    findAll(): Promise<Category[]>;
    update(id: string, data: UpdateCategoryDTO): Promise<Category>;
    delete(id: string): Promise<void>;
    findBySlug(slug: string): Promise<Category | null>;
}
