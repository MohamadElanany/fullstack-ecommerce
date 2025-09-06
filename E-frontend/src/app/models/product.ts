export interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  photo?: string;
  stock?: number;
  section?: 'mens'|'womens'|'unisex';
  isActive?: boolean;
  isDeleted?: boolean;
  categoryId?: { _id: string; name?: string; section?: string } | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
}
