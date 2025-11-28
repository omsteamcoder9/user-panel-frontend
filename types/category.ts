// types/category.ts
export interface Category {
  _id: string;
  name: string;
  description: string;
  slug: string;
  status: 'active' | 'inactive';
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CategoryResponse {
  success: boolean;
  data: Category[];
  count: number;
}