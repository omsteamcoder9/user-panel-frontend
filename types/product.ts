// types/product.ts
export interface ProductImage {
  image: string;
  _id: string;
}

export interface ProductSize {
  size: string;
  stock: number;
  _id?: string;
}

export interface Product {
  _id: string;
  sNo: number;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: string | {
    _id: string;
    name: string;
    slug: string;
    description?: string;
  };
  rating: number;
  images: ProductImage[];
  seller: string;
  stock: number;
  numberOfReviews: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  status: 'active' | 'inactive' | 'out-of-stock';
  featured: boolean;
  tags?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  ratings?: {
    average: number;
    count: number;
  };
  sizes?: ProductSize[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse {
  success: boolean;
  count: number;
  data: Product[];
}

export interface RawApiResponse {
  success: boolean;
  count: number;
  data?: Product[];
  products?: Product[];
  message?: string;
}

export interface FilterOptions {
  category?: string;
  priceRange?: string;
  categories?: string | string[];
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  featured?: boolean;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PriceRange {
  range: string;
  count: number;
  minPrice: number;
  maxPrice: number;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface FilteredProductsResponse {
  success: boolean;
  data: Product[];
  pagination: PaginationInfo;
}

export interface FeaturedProductsResponse {
  success: boolean;
  count: number;
  data: Product[];
}

export interface PriceRangesResponse {
  success: boolean;
  data: PriceRange[];
}