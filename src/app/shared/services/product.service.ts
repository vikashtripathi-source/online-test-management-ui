import { Injectable } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { Product, ProductRequest } from '../../core/models/product.model';
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

  createProduct(product: ProductRequest): Observable<Product> {
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

  // Enhanced stock validation methods
  validateStockAvailability(productId: number, requestedQuantity: number): Observable<boolean> {
    return this.getProductById(productId).pipe(
      map(product => {
        if (!product) {
          throw new Error('Product not found');
        }
        if (product.active === false) {
          throw new Error('Product is not available for purchase');
        }
        if (product.stockQuantity < requestedQuantity) {
          throw new Error(`Insufficient stock. Available: ${product.stockQuantity}, Requested: ${requestedQuantity}`);
        }
        return true;
      }),
      catchError((error: any) => {
        console.error('Stock validation error:', error);
        throw error;
      })
    );
  }

  adjustStockOnCartAdd(productId: number, quantity: number): Observable<Product> {
    return this.validateStockAvailability(productId, quantity).pipe(
      switchMap(() => {
        // Decrease stock when item is added to cart
        return this.decreaseStock(productId, quantity);
      })
    );
  }

  adjustStockOnCartRemove(productId: number, quantity: number): Observable<Product> {
    // Increase stock when item is removed from cart
    return this.increaseStock(productId, quantity);
  }

  adjustStockOnCartUpdate(productId: number, oldQuantity: number, newQuantity: number): Observable<Product> {
    if (newQuantity > oldQuantity) {
      // Need to decrease stock for additional items
      const additionalQuantity = newQuantity - oldQuantity;
      return this.validateStockAvailability(productId, additionalQuantity).pipe(
        switchMap(() => this.decreaseStock(productId, additionalQuantity))
      );
    } else if (newQuantity < oldQuantity) {
      // Need to increase stock for removed items
      const removedQuantity = oldQuantity - newQuantity;
      return this.increaseStock(productId, removedQuantity);
    }
    // No change in quantity
    return this.getProductById(productId);
  }

  // Batch stock operations for cart operations
  restoreStockForCartItems(cartItems: any[]): Observable<Product[]> {
    const restoreRequests = cartItems.map(item => 
      this.adjustStockOnCartRemove(item.productId || item.id, item.quantity || 1)
    );
    
    if (restoreRequests.length === 0) {
      return of([]);
    }
    
    return forkJoin(restoreRequests);
  }

  // Stock validation for order placement
  validateCartStockAvailability(cartItems: any[]): Observable<boolean> {
    const validationRequests = cartItems.map(item => 
      this.validateStockAvailability(item.productId || item.id, item.quantity || 1)
    );
    
    if (validationRequests.length === 0) {
      return of(true);
    }
    
    return forkJoin(validationRequests).pipe(
      map(results => results.every(result => result === true))
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

  // Image Upload Methods
  uploadProductImage(productId: number, image: File): Observable<string> {
    const formData = new FormData();
    formData.append('image', image);
    
    return this.http.post<string>(`${this.getBaseUrl()}/products/${productId}/image`, formData);
  }

  getProductImage(productId: number): Observable<Blob> {
    return this.http.get(`${this.getBaseUrl()}/products/${productId}/image`, { responseType: 'blob' });
  }

  updateProductImage(productId: number, image: File): Observable<string> {
    const formData = new FormData();
    formData.append('image', image);
    
    return this.http.put<string>(`${this.getBaseUrl()}/products/${productId}/image`, formData);
  }

  deleteProductImage(productId: number): Observable<void> {
    return this.http.delete<void>(`${this.getBaseUrl()}/products/${productId}/image`);
  }
}
