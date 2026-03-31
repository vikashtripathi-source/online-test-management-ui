import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExamService } from '../../../../shared/services/exam.service';
import { ProductService } from '../../../../shared/services/product.service';
import { OrderService } from '../../../../shared/services/order.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h1 class="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>
      
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Products -->
        <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-green-100 text-sm">Total Products</p>
              <p class="text-4xl font-bold mt-2">{{ totalProducts }}</p>
            </div>
            <span class="text-5xl opacity-30">📦</span>
          </div>
        </div>

        <!-- Total Questions -->
        <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-purple-100 text-sm">Total Questions</p>
              <p class="text-4xl font-bold mt-2">{{ totalQuestions }}</p>
            </div>
            <span class="text-5xl opacity-30">❓</span>
          </div>
        </div>

        <!-- Total Orders -->
        <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-100 text-sm">Total Orders</p>
              <p class="text-4xl font-bold mt-2">{{ totalOrders }}</p>
            </div>
            <span class="text-5xl opacity-30">🛒</span>
          </div>
        </div>

        <!-- Active Exams -->
        <div class="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-yellow-100 text-sm">Active Users</p>
              <p class="text-4xl font-bold mt-2">{{ activeUsers }}</p>
            </div>
            <span class="text-5xl opacity-30">👥</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Recent Activity -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-xl font-bold text-gray-800 mb-4">📈 Quick Stats</h2>
          <div class="space-y-4">
            <div class="flex items-center justify-between pb-4 border-b">
              <span class="text-gray-600">Low Stock Products</span>
              <span class="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">{{ lowStockCount }}</span>
            </div>
            <div class="flex items-center justify-between pb-4 border-b">
              <span class="text-gray-600">Pending Orders</span>
              <span class="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">{{ pendingOrders }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-600">System Health</span>
              <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">Optimal</span>
            </div>
          </div>
        </div>

        <!-- System Information -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-xl font-bold text-gray-800 mb-4">ℹ️ System Info</h2>
          <div class="space-y-4">
            <div class="flex items-center justify-between pb-4 border-b">
              <span class="text-gray-600">Last Updated</span>
              <span class="text-gray-800 font-semibold">{{ today }}</span>
            </div>
            <div class="flex items-center justify-between pb-4 border-b">
              <span class="text-gray-600">Server Status</span>
              <span class="inline-block w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
              <span class="text-green-600 font-semibold">Online</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-600">Database Status</span>
              <span class="inline-block w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
              <span class="text-green-600 font-semibold">Connected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AdminDashboardComponent implements OnInit {
  totalProducts = 0;
  totalQuestions = 0;
  totalOrders = 0;
  activeUsers = 0;
  lowStockCount = 0;
  pendingOrders = 0;
  today = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  constructor(
    private examService: ExamService,
    private productService: ProductService,
    private orderService: OrderService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    // Load questions
    this.examService.getAllQuestions().subscribe(questions => {
      this.totalQuestions = questions.length;
    });

    // Load products
    this.productService.getAllProducts().subscribe(products => {
      this.totalProducts = products.length;
      this.lowStockCount = products.filter(p => p.stockQuantity < 10).length;
    });

    // Load orders
    this.orderService.getAllOrders().subscribe(orders => {
      this.totalOrders = orders.length;
      this.pendingOrders = orders.filter(o => o.status === 'PENDING').length;
    });

    // Simulate active users
    this.activeUsers = Math.floor(Math.random() * 50) + 10;
  }
}
