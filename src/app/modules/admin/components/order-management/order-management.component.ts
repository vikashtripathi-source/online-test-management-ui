import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../../shared/services/order.service';
import { StudentService } from '../../../../shared/services/student.service';
import { Order } from '../../../../core/models/order.model';

@Component({
  selector: 'app-order-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <h1 class="text-3xl font-bold text-gray-800 mb-8">Order Management</h1>

      <!-- Overview Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <p class="text-blue-100 text-sm">Total Orders</p>
          <p class="text-3xl font-bold mt-2">{{ orders.length }}</p>
        </div>
        <div class="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
          <p class="text-yellow-100 text-sm">Pending Orders</p>
          <p class="text-3xl font-bold mt-2">{{ pendingOrders }}</p>
        </div>
        <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <p class="text-green-100 text-sm">Delivered Orders</p>
          <p class="text-3xl font-bold mt-2">{{ deliveredOrders }}</p>
        </div>
        <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <p class="text-purple-100 text-sm">Total Revenue</p>
          <p class="text-3xl font-bold mt-2">\${{ totalRevenue.toFixed(2) }}</p>
        </div>
      </div>

      <!-- Orders Table -->
      <div class="bg-white rounded-lg shadow-lg overflow-hidden">
        <div class="p-8">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">📋 All Orders</h2>

          <!-- Filter -->
          <div class="mb-6">
            <select 
              [(ngModel)]="selectedStatus"
              (ngModelChange)="onStatusChange()"
              class="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500">
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <!-- Table -->
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-100 border-b-2 border-gray-300">
                <tr>
                  <th class="px-6 py-3 text-left text-sm font-bold text-gray-800">Order ID</th>
                  <th class="px-6 py-3 text-left text-sm font-bold text-gray-800">Student</th>
                  <th class="px-6 py-3 text-left text-sm font-bold text-gray-800">Items</th>
                  <th class="px-6 py-3 text-left text-sm font-bold text-gray-800">Amount</th>
                  <th class="px-6 py-3 text-left text-sm font-bold text-gray-800">Date</th>
                  <th class="px-6 py-3 text-left text-sm font-bold text-gray-800">Status</th>
                  <th class="px-6 py-3 text-left text-sm font-bold text-gray-800">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let order of filteredOrders" class="border-b hover:bg-gray-50 transition">
                  <td class="px-6 py-4 text-sm font-semibold text-gray-800">#{{ order.id }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600">Student #{{ order.studentId }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ order.orderItems.length }} item(s)</td>
                  <td class="px-6 py-4 text-sm font-bold text-green-600">\${{ order.totalAmount.toFixed(2) }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ formatDate(order.orderDate) }}</td>
                  <td class="px-6 py-4">
                    <span [ngClass]="{
                      'bg-yellow-100 text-yellow-800': order.status === 'PENDING',
                      'bg-blue-100 text-blue-800': order.status === 'CONFIRMED',
                      'bg-purple-100 text-purple-800': order.status === 'SHIPPED',
                      'bg-green-100 text-green-800': order.status === 'DELIVERED',
                      'bg-red-100 text-red-800': order.status === 'CANCELLED'
                    }" class="inline-block px-3 py-1 rounded-full text-xs font-bold">
                      {{ order.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <button 
                      (click)="viewOrderDetails(order)"
                      class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition text-sm font-semibold">
                      👁️ View
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div *ngIf="filteredOrders.length === 0" class="text-center py-12">
            <p class="text-gray-500 text-lg">No orders found. 📭</p>
          </div>
        </div>
      </div>

      <!-- Order Details Modal -->
      <div *ngIf="selectedOrder" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-8 max-h-96 overflow-auto">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-800">Order Details #{{ selectedOrder.id }}</h2>
            <button (click)="selectedOrder = null" class="text-2xl text-gray-500 hover:text-gray-800">✕</button>
          </div>

          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-50 p-4 rounded-lg">
                <p class="text-sm text-gray-600">Student ID</p>
                <p class="text-lg font-bold text-gray-800">{{ selectedOrder.studentId }}</p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <p class="text-sm text-gray-600">Total Amount</p>
                <p class="text-lg font-bold text-green-600">\${{ selectedOrder.totalAmount.toFixed(2) }}</p>
              </div>
            </div>

            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-sm text-gray-600">Order Date</p>
              <p class="text-lg font-bold text-gray-800">{{ formatDate(selectedOrder.orderDate) }}</p>
            </div>

            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-sm text-gray-600 mb-3">Status</p>
              <select 
                [(ngModel)]="selectedOrder.status"
                (ngModelChange)="updateOrderStatus(selectedOrder.id, selectedOrder.status)"
                class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500">
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div>
              <p class="text-sm text-gray-600 mb-3 font-semibold">Items</p>
              <div class="space-y-2">
                <div *ngFor="let item of selectedOrder.orderItems" class="bg-gray-50 p-3 rounded-lg">
                  <p class="text-sm">Product #{{ item.productId }} - Qty: {{ item.quantity }} × \${{ item.price.toFixed(2) }}</p>
                </div>
              </div>
            </div>
          </div>

          <button 
            (click)="selectedOrder = null"
            class="w-full mt-6 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition font-semibold">
            Close
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class OrderManagementComponent implements OnInit {
  orders: Order[] = [];
  selectedOrder: Order | null = null;
  selectedStatus = '';
  loading = false;

  constructor(
    private orderService: OrderService,
    private studentService: StudentService
  ) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.orderService.getAllOrders().subscribe({
      next: (data) => {
        this.orders = data;
      },
      error: (err) => {
        console.error('Failed to load orders:', err);
      }
    });
  }

  get filteredOrders(): Order[] {
    return this.selectedStatus 
      ? this.orders.filter(o => o.status === this.selectedStatus)
      : this.orders;
  }

  get pendingOrders(): number {
    return this.orders.filter(o => o.status === 'PENDING').length;
  }

  get deliveredOrders(): number {
    return this.orders.filter(o => o.status === 'DELIVERED').length;
  }

  get totalRevenue(): number {
    return this.orders.reduce((sum, o) => sum + o.totalAmount, 0);
  }

  onStatusChange() {
    // Filter updates automatically through getter
  }

  viewOrderDetails(order: Order) {
    this.selectedOrder = { ...order };
  }

  updateOrderStatus(orderId: number, newStatus: string) {
    this.orderService.updateOrderStatus(orderId, newStatus).subscribe({
      next: () => {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
          order.status = newStatus as any;
        }
      },
      error: (err) => {
        console.error('Failed to update order status:', err);
      }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
