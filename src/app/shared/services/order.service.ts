import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { Order } from '../../core/models/order.model';
import { ApiService } from './api.service';
import { HttpClient } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { StockErrorHandlerService } from './stock-error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService extends ApiService {
  private ordersBaseUrl = 'http://localhost:8089/api';
  private cart$ = new BehaviorSubject<any[]>([]);
  private currentStudentId: number | null = null;

  constructor(
    http: HttpClient,
    private stockErrorHandler: StockErrorHandlerService
  ) {
    super(http);
    this.loadCartFromStorage();
  }

  private loadCartFromStorage() {
    const cart = localStorage.getItem('cart');
    if (cart) {
      this.cart$.next(JSON.parse(cart));
    }
  }

  private saveCartToStorage(cart: any[]) {
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  setCurrentStudent(studentId: number) {
    this.currentStudentId = studentId;
    // Load cart from backend when student is set
    this.loadCartFromBackend();
  }

  // Cart API Methods
  getCart(): Observable<any[]> {
    if (this.currentStudentId) {
      return this.http.get<any[]>(`${this.ordersBaseUrl}/cart/${this.currentStudentId}`).pipe(
        tap(cart => {
          this.cart$.next(cart);
          this.saveCartToStorage(cart);
        }),
        catchError(error => {
          console.error('Error loading cart from backend:', error);
          // Fallback to localStorage on error
          return this.cart$.asObservable();
        })
      );
    }
    return this.cart$.asObservable();
  }

  private loadCartFromBackend() {
    if (this.currentStudentId) {
      this.getCart().subscribe({
        next: (cart) => {
          console.log('OrderService - Cart loaded from backend:', cart);
          this.cart$.next(cart);
          this.saveCartToStorage(cart);
          // Force change detection
          setTimeout(() => {
            this.cart$.next([...cart]);
          }, 100);
        },
        error: (error) => {
          console.error('Error loading cart from backend:', error);
          // Fallback to localStorage on error
          return this.cart$.asObservable();
        }
      });
    }
  }

  addToCart(productId: number, quantity: number = 1): Observable<any> {
    if (!this.currentStudentId) {
      console.error('No student ID set for cart operations');
      return of(null);
    }

    return this.http.post<any>(
      `${this.ordersBaseUrl}/cart/add?studentId=${this.currentStudentId}&productId=${productId}&quantity=${quantity}`,
      {}
    ).pipe(
      tap(response => {
        console.log('Product added to cart with stock update:', response);
        // Refresh cart after adding item
        this.loadCartFromBackend();
      }),
      catchError(error => {
        console.error('Error adding to cart:', error);
        return this.stockErrorHandler.handleStockError(error);
      })
    );
  }

  addToCartLegacy(product: any): void {
    // Legacy method for backward compatibility
    console.log('=== ORDER SERVICE ADD TO CART (LEGACY) ===');
    console.log('Current cart:', this.cart$.value);
    console.log('Adding product:', product);
    
    const current = this.cart$.value;
    const existing = current.find(item => item.id === product.id);
    
    if (existing) {
      console.log('Product exists in cart, increasing quantity...');
      existing.quantity++;
      console.log('Updated existing item:', existing);
    } else {
      console.log('Product not in cart, adding new item...');
      const newItem = { ...product, quantity: 1 };
      current.push(newItem);
      console.log('Added new item:', newItem);
    }
    
    console.log('Final cart before update:', current);
    this.cart$.next([...current]);
    this.saveCartToStorage(current);
    console.log('Cart saved to localStorage');
    console.log('=== ORDER SERVICE ADD TO CART COMPLETE ===');
  }

  updateCartItemQuantity(itemId: number, quantity: number): Observable<any> {
    return this.http.put<any>(
      `${this.ordersBaseUrl}/cart/update?itemId=${itemId}&quantity=${quantity}`,
      {}
    ).pipe(
      tap(response => {
        console.log('Cart item quantity updated with stock adjustment:', response);
        // Refresh cart after updating
        this.loadCartFromBackend();
      }),
      catchError(error => {
        console.error('Error updating cart item:', error);
        return this.stockErrorHandler.handleStockError(error);
      })
    );
  }

  removeFromCart(itemId: number): Observable<void> {
    return this.http.delete<void>(`${this.ordersBaseUrl}/cart/${itemId}`).pipe(
      tap(() => {
        console.log('Cart item removed with stock restoration:', itemId);
        // Refresh cart after removing item
        this.loadCartFromBackend();
      }),
      catchError(error => {
        console.error('Error removing from cart:', error);
        throw error;
      })
    );
  }

  removeFromCartLegacy(productId: number): void {
    // Legacy method for backward compatibility
    const current = this.cart$.value.filter(item => item.id !== productId);
    this.cart$.next(current);
    this.saveCartToStorage(current);
  }

  clearCart(): Observable<void> {
    if (this.currentStudentId) {
      return this.http.delete<void>(`${this.ordersBaseUrl}/cart/${this.currentStudentId}`).pipe(
        tap(() => {
          console.log('Cart cleared with stock restoration for student:', this.currentStudentId);
          this.cart$.next([]);
          this.saveCartToStorage([]);
        }),
        catchError(error => {
          console.error('Error clearing cart:', error);
          // Fallback to local clear
          this.cart$.next([]);
          this.saveCartToStorage([]);
          return of(void 0);
        })
      );
    } else {
      // Legacy clear for compatibility
      this.cart$.next([]);
      this.saveCartToStorage([]);
      return of(void 0);
    }
  }

  // Order API calls
  getAllOrders(): Observable<Order[]> {
    return this.get<Order[]>('/orders');
  }

  getOrderById(id: number): Observable<Order> {
    return this.get<Order>(`/orders/${id}`);
  }

  createOrder(order: Order): Observable<Order> {
    return this.post<Order>('/orders', order);
  }

  updateOrder(id: number, order: Order): Observable<Order> {
    return this.put<Order>(`/orders/${id}`, order);
  }

  deleteOrder(id: number): Observable<void> {
    return this.delete<void>(`/orders/${id}`);
  }

  submitOrderWithAddress(studentId: number, orderItems: any[], addressId: number): Observable<Order> {
    const order = {
      studentId,
      orderItems,
      addressId
    };
    return this.post<Order>('/orders/submit', order);
  }

  submitOrderFromCart(studentId: number, addressId: number): Observable<Order> {
    const request = {
      studentId,
      addressId
    };
    return this.http.post<Order>(`${this.ordersBaseUrl}/orders/submit-cart`, request).pipe(
      tap(response => {
        console.log('Order submitted from cart with stock updates:', response);
        // Cart is automatically cleared by backend after successful order
        this.loadCartFromBackend();
      }),
      catchError(error => {
        console.error('Error submitting order from cart:', error);
        return this.stockErrorHandler.handleStockError(error);
      })
    );
  }

  // Additional methods for admin functionality
  getOrdersByStatus(status: string): Observable<Order[]> {
    return this.get<Order[]>(`/orders/status/${status}`);
  }

  getOrdersByDateRange(startDate: string, endDate: string): Observable<Order[]> {
    return this.get<Order[]>(`/orders/date-range?start=${startDate}&end=${endDate}`);
  }

  getOrderStats(): Observable<any> {
    return this.get<any>('/orders/stats');
  }

  getOrdersByStudent(studentId: number): Observable<Order[]> {
    return this.get<Order[]>(`/orders/student/${studentId}`);
  }

  updateOrderStatus(id: number, status: string): Observable<Order> {
    return this.put<Order>(`/orders/${id}/status`, { status });
  }
}
