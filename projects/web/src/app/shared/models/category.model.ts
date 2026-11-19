export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export type CreateCategoryDto = Omit<Category, 'id'>;
