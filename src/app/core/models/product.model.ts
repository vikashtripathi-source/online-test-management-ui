export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  branch: string;
  category: string;
  imageUrl?: string;
}

export interface ProductDTO extends Product {}
