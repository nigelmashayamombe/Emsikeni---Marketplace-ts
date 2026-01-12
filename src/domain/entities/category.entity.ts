export interface CategoryProps {
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
    createdAt: Date;
    updatedAt: Date;
    children?: Category[];
}

export class Category {
    private constructor(private readonly props: CategoryProps) { }

    static create(props: CategoryProps): Category {
        return new Category(props);
    }

    get id(): string {
        return this.props.id;
    }

    get name(): string {
        return this.props.name;
    }

    get slug(): string {
        return this.props.slug;
    }

    get parentId(): string | null {
        return this.props.parentId;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get updatedAt(): Date {
        return this.props.updatedAt;
    }

    get children(): Category[] {
        return this.props.children || [];
    }
}
