import { Injectable } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
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

  // Stock Management Methods
  fixZeroStockProducts(): Observable<Product[]> {
    // This method will update all products with 0 stock to have 50 stock
    return this.get<Product[]>('/products').pipe(
      switchMap(products => {
        const zeroStockProducts = products.filter(p => p.stockQuantity <= 0);
        console.log('Found', zeroStockProducts.length, 'products with zero stock');
        
        if (zeroStockProducts.length === 0) {
          return of(products);
        }
        
        // Update all zero stock products to have 50 stock
        const updateRequests = zeroStockProducts.map(product => 
          this.put<Product>(`/products/${product.id}/stock?stockQuantity=50`, {})
        );
        
        return forkJoin(updateRequests).pipe(
          map(() => products.map(p => p.stockQuantity <= 0 ? {...p, stockQuantity: 50} : p))
        );
      })
    );
  }

  updateStock(id: number, quantity: number): Observable<Product> {
    return this.put<Product>(`/products/${id}/stock?stockQuantity=${quantity}`, {});
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

  // Image Upload Methods (Note: These are not in the current API documentation but needed for functionality)
  // Based on the student image upload pattern, these would need to be implemented in the backend
  uploadProductImage(productId: number, image: File): Observable<string> {
    const formData = new FormData();
    formData.append('image', image);
    
    // This endpoint doesn't exist in the current API - would need to be added to backend
    return this.http.post<string>(`${this.getBaseUrl()}/products/${productId}/image`, formData);
  }

  getProductImage(productId: number): Observable<Blob> {
    // This endpoint doesn't exist in the current API - would need to be added to backend
    return this.http.get(`${this.getBaseUrl()}/products/${productId}/image`, { responseType: 'blob' });
  }

  updateProductImage(productId: number, image: File): Observable<string> {
    const formData = new FormData();
    formData.append('image', image);
    
    // This endpoint doesn't exist in the current API - would need to be added to backend
    return this.http.put<string>(`${this.getBaseUrl()}/products/${productId}/image`, formData);
  }

  deleteProductImage(productId: number): Observable<void> {
    // This endpoint doesn't exist in the current API - would need to be added to backend
    return this.http.delete<void>(`${this.getBaseUrl()}/products/${productId}/image`);
  }
}
