export interface Product {
  id: number;
  name: string;
  productName?: string; // Add productName as optional for API compatibility
  description: string;
  price: number;
  stockQuantity: number;
  branch: 'MECHANICAL' | 'EC' | 'IT' | 'CSE';
  category: string;
  imageUrl?: string;
  active?: boolean; // Add active status field
}

// DTO for API requests (backend format)
export interface ProductRequest {
  productName: string;
  description: string;
  price: number;
  stockQuantity: number;
  branch: 'MECHANICAL' | 'EC' | 'IT' | 'CSE';
  category: string;
  imageUrl?: string;
  active: boolean;
}

export interface CartItem extends Product {
  quantity?: number;
  productId?: number;
}

export interface ProductDTO extends Product {}
