import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../../../shared/services/product.service';
import { Product } from '../../../../core/models/product.model';

@Component({
  selector: 'app-product-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div>
      <h1 class="text-3xl font-bold text-gray-800 mb-8">Product Management</h1>

      <!-- Add Product Form -->
      <div class="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span>➕</span> Add New Product
        </h2>

        <form [formGroup]="productForm" (ngSubmit)="addProduct()" class="space-y-6">
          <!-- Product Name -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Product Name *</label>
            <input 
              type="text"
              formControlName="name"
              class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
              placeholder="Enter product name">
            <p class="text-red-500 text-sm mt-1" *ngIf="isFieldInvalid('name')">
              Product name is required
            </p>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
            <textarea 
              formControlName="description"
              rows="3"
              class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
              placeholder="Enter product description..."></textarea>
          </div>

          <!-- Price and Stock -->
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Price ($) *</label>
              <input 
                type="number"
                formControlName="price"
                class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                placeholder="0.00">
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Stock Quantity *</label>
              <input 
                type="number"
                formControlName="stockQuantity"
                class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                placeholder="0">
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
              <select 
                formControlName="category"
                class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none">
                <option value="">Select Category</option>
                <option value="BOOKS">Books</option>
                <option value="GUIDES">Guides</option>
                <option value="MATERIALS">Materials</option>
                <option value="TOOLS">Tools</option>
              </select>
            </div>
          </div>

          <!-- Branch -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Branch *</label>
            <select 
              formControlName="branch"
              class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none">
              <option value="">Select Branch</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="MECH">MECH</option>
              <option value="CIVIL">CIVIL</option>
            </select>
          </div>

          <!-- Image URL -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Image URL</label>
            <input 
              type="url"
              formControlName="imageUrl"
              class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
              placeholder="https://example.com/image.jpg">
          </div>

          <!-- Submit Button -->
          <button 
            type="submit"
            [disabled]="!productForm.valid || loading"
            class="w-full bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white font-bold py-3 rounded-lg transition disabled:opacity-50">
            {{ loading ? '⏳ Adding...' : '➕ Add Product' }}
          </button>

          <!-- Messages -->
          <div *ngIf="successMessage" class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded">
            ✅ {{ successMessage }}
          </div>
          <div *ngIf="errorMessage" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
            ❌ {{ errorMessage }}
          </div>
        </form>
      </div>

      <!-- Products List -->
      <div class="bg-white rounded-lg shadow-lg p-8">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">📦 All Products ({{ products.length }})</h2>

        <!-- Filters -->
        <div class="mb-6 flex gap-4">
          <input 
            type="text"
            placeholder="Search products..."
            [(ngModel)]="searchTerm"
            class="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 flex-1">
          <select 
            [(ngModel)]="selectedCategory"
            class="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500">
            <option value="">All Categories</option>
            <option value="BOOKS">Books</option>
            <option value="GUIDES">Guides</option>
            <option value="MATERIALS">Materials</option>
            <option value="TOOLS">Tools</option>
          </select>
        </div>

        <!-- Products Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let product of filteredProducts" class="border-2 border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
            <!-- Product Image -->
            <div class="w-full h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
              <img 
                *ngIf="product.imageUrl"
                [src]="product.imageUrl"
                alt="{{ product.name }}"
                class="w-full h-full object-cover">
              <span *ngIf="!product.imageUrl" class="text-4xl">📦</span>
            </div>

            <div class="p-4">
              <h3 class="text-lg font-bold text-gray-800 mb-2">{{ product.name }}</h3>
              <p class="text-sm text-gray-600 mb-3 line-clamp-2">{{ product.description }}</p>

              <div class="flex gap-2 mb-3">
                <span class="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">{{ product.branch }}</span>
                <span class="inline-block px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-semibold">{{ product.category }}</span>
              </div>

              <div class="flex items-center justify-between mb-4">
                <p class="text-2xl font-bold text-green-600">\${{ product.price.toFixed(2) }}</p>
                <p [ngClass]="{
                  'text-red-600': product.stockQuantity < 10,
                  'text-yellow-600': product.stockQuantity >= 10 && product.stockQuantity < 50,
                  'text-green-600': product.stockQuantity >= 50
                }" class="font-semibold">
                  Stock: {{ product.stockQuantity }}
                </p>
              </div>

              <button 
                (click)="deleteProduct(product.id)"
                class="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition font-semibold">
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>

        <div *ngIf="filteredProducts.length === 0" class="text-center py-12">
          <p class="text-gray-500 text-lg">No products found. Create one to get started! 🚀</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class ProductAdminComponent implements OnInit {
  products: Product[] = [];
  productForm!: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';
  searchTerm = '';
  selectedCategory = '';

  constructor(
    private productService: ProductService,
    private fb: FormBuilder
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.loadProducts();
  }

  initForm() {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      stockQuantity: ['', [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      branch: ['', Validators.required],
      imageUrl: ['']
    });
  }

  loadProducts() {
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;
      },
      error: () => {
        this.errorMessage = 'Failed to load products';
      }
    });
  }

  addProduct() {
    if (this.productForm.invalid) return;

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.productService.createProduct(this.productForm.value).subscribe({
      next: (product) => {
        this.products.push(product);
        this.productForm.reset();
        this.successMessage = 'Product added successfully! ✅';
        this.loading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.errorMessage = 'Failed to add product. Please try again.';
        this.loading = false;
      }
    });
  }

  deleteProduct(id: number) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.products = this.products.filter(p => p.id !== id);
          this.successMessage = 'Product deleted successfully! ✅';
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: () => {
          this.errorMessage = 'Failed to delete product.';
        }
      });
    }
  }

  get filteredProducts(): Product[] {
    return this.products.filter(p => 
      (p.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
       p.description.toLowerCase().includes(this.searchTerm.toLowerCase())) &&
      (!this.selectedCategory || p.category === this.selectedCategory)
    );
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
