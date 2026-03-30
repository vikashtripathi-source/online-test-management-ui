import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { Order } from '../../core/models/order.model';
import { ApiService } from './api.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class OrderService extends ApiService {
  private ordersBaseUrl = 'http://localhost:8089/api/orders';
  private cart$ = new BehaviorSubject<any[]>([]);

  constructor(http: HttpClient) {
    super(http);
    this.loadCart();
  }

  private loadCart() {
    const cart = localStorage.getItem('cart');
    if (cart) {
      this.cart$.next(JSON.parse(cart));
    }
  }

  getCart(): Observable<any[]> {
    return this.cart$.asObservable();
  }

  addToCart(product: any): void {
    const current = this.cart$.value;
    const existing = current.find(item => item.id === product.id);
    
    if (existing) {
      existing.quantity++;
    } else {
      current.push({ ...product, quantity: 1 });
    }
    
    this.cart$.next([...current]);
    localStorage.setItem('cart', JSON.stringify(current));
  }

  removeFromCart(productId: number): void {
    const current = this.cart$.value.filter(item => item.id !== productId);
    this.cart$.next(current);
    localStorage.setItem('cart', JSON.stringify(current));
  }

  clearCart(): void {
    this.cart$.next([]);
    localStorage.removeItem('cart');
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

  getOrdersByStudent(studentId: number): Observable<Order[]> {
    return this.get<Order[]>(`/orders/student/${studentId}`);
  }
}
