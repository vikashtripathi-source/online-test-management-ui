import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { CartItem, Product } from '../../core/models/product.model';
import { Order } from '../../core/models/order.model';
import { ApiService } from './api.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class OrderService extends ApiService {
  private cart$ = new BehaviorSubject<CartItem[]>([]);
  private currentStudentId: number | null = null;
  private ordersBaseUrl = 'http://localhost:8089/api';

  constructor(http: HttpClient) {
    super(http);
    this.loadCartFromStorage();
  }

  // Cart Management
  getCart(): Observable<CartItem[]> {
    if (this.currentStudentId) {
      return this.http.get<CartItem[]>(`${this.ordersBaseUrl}/cart/${this.currentStudentId}`);
    }
    return this.cart$.asObservable();
  }

  setCurrentStudent(studentId: number): void {
    this.currentStudentId = studentId;
    this.loadCartFromBackend();
  }

  private loadCartFromStorage(): void {
    const cart = localStorage.getItem('cart');
    if (cart) {
      this.cart$.next(JSON.parse(cart));
    }
  }

  private saveCartToStorage(cart: CartItem[]): void {
    localStorage.setItem('cart', JSON.stringify(cart));
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
        error: (err) => {
          console.error('Error loading cart from backend:', err);
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
        // Refresh cart after adding item
        this.loadCartFromBackend();
      }),
      catchError(error => {
        console.error('Error adding to cart:', error);
        throw error;
      })
    );
  }

  removeFromCart(cartItemId: number): Observable<void> {
    return this.http.delete<void>(`${this.ordersBaseUrl}/cart/${cartItemId}`).pipe(
      tap(() => {
        this.loadCartFromBackend();
      })
    );
  }

  updateCartItemQuantity(cartItemId: number, quantity: number): Observable<void> {
    return this.http.put<void>(`${this.ordersBaseUrl}/cart/${cartItemId}`, { quantity }).pipe(
      tap(() => {
        this.loadCartFromBackend();
      })
    );
  }

  clearCart(): Observable<void> {
    if (this.currentStudentId) {
      return this.http.delete<void>(`${this.ordersBaseUrl}/cart/${this.currentStudentId}`).pipe(
        tap(() => {
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

  // Order Management
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

  updateOrderStatus(id: number, status: string): Observable<Order> {
    return this.put<Order>(`/orders/${id}/status`, { status });
  }

  // Additional methods for admin functionality
  getOrdersByStatus(status: string): Observable<Order[]> {
    return this.get<Order[]>(`/orders/status/${status}`);
  }

  getOrdersByStudent(studentId: number): Observable<Order[]> {
    return this.get<Order[]>(`/orders/student/${studentId}`);
  }

  getOrdersByDateRange(startDate: string, endDate: string): Observable<Order[]> {
    return this.get<Order[]>(`/orders/date-range?start=${startDate}&end=${endDate}`);
  }

  getOrderStats(): Observable<any> {
    return this.get<any>('/orders/stats');
  }

  submitOrderFromCart(studentId: number, addressId: number): Observable<Order> {
    const request = {
      studentId,
      addressId
    };
    return this.http.post<Order>(`${this.ordersBaseUrl}/orders/submit-cart`, request);
  }

  // Legacy methods for backward compatibility
  addToCartLegacy(product: any): void {
    const current = this.cart$.value;
    const existing = current.find(item => item.id === product.id);
    
    if (existing) {
      existing.quantity++;
    } else {
      const newItem = { ...product, quantity: 1 };
      current.push(newItem);
    }
    
    this.cart$.next([...current]);
    this.saveCartToStorage(current);
  }

  removeFromCartLegacy(productId: number): void {
    const current = this.cart$.value;
    const updated = current.filter(item => item.id !== productId);
    this.cart$.next(updated);
    this.saveCartToStorage(updated);
  }
}
