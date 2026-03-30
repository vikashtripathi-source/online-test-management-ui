import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../../core/models/product.model';
import { ApiService } from './api.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProductService extends ApiService {
  constructor(http: HttpClient) {
    super(http);
  }

  getAllProducts(): Observable<Product[]> {
    return this.get<Product[]>('/products');
  }

  getAll(): Observable<Product[]> {
    return this.getAllProducts();
  }

  getProductById(id: number): Observable<Product> {
    return this.get<Product>(`/products/${id}`);
  }

  getProductsByBranch(branch: string): Observable<Product[]> {
    return this.get<Product[]>(`/products/branch/${branch}`);
  }

  createProduct(product: Product): Observable<Product> {
    return this.post<Product>('/products', product);
  }

  updateProduct(id: number, product: Product): Observable<Product> {
    return this.put<Product>(`/products/${id}`, product);
  }

  deleteProduct(id: number): Observable<void> {
    return this.delete<void>(`/products/${id}`);
  }

  // Inventory Management
  getInventoryStatus(): Observable<Product[]> {
    return this.get<Product[]>('/products/inventory');
  }

  getLowStockProducts(): Observable<Product[]> {
    return this.get<Product[]>('/products/inventory/low-stock');
  }

  updateStock(id: number, quantity: number): Observable<Product> {
    return this.put<Product>(`/products/${id}/stock`, { stockQuantity: quantity });
  }

  increaseStock(id: number, quantity: number): Observable<Product> {
    return this.post<Product>(`/products/${id}/stock/increase`, { quantity });
  }

  decreaseStock(id: number, quantity: number): Observable<Product> {
    return this.post<Product>(`/products/${id}/stock/decrease`, { quantity });
  }

  getBranchInventory(branch: string): Observable<Product[]> {
    return this.get<Product[]>(`/products/inventory/branch/${branch}`);
  }
}
