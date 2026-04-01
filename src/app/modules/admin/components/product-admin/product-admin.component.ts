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
      <h1 class="text-3xl font-bold text-gray-800 mb-8">Product Management 🖼️</h1>

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

          <!-- Image Upload -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Product Image</label>
            <div class="space-y-3">
              <!-- File Upload -->
              <div>
                <input
                  type="file"
                  (change)="onImageSelect($event)"
                  accept="image/*"
                  class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none">
              </div>

              <!-- Image Preview -->
              <div *ngIf="imagePreview" class="mt-2">
                <img
                  [src]="imagePreview"
                  alt="Product preview"
                  class="h-32 w-32 object-cover rounded-lg border-2 border-gray-300">
                <button
                  type="button"
                  (click)="removeImage()"
                  class="ml-2 text-red-600 hover:text-red-800 text-sm">
                  Remove
                </button>
              </div>

              <!-- Fallback URL Input -->
              <div class="text-sm text-gray-600">
                <p>Or enter image URL manually:</p>
                <input
                  type="url"
                  formControlName="imageUrl"
                  class="w-full px-3 py-1 border border-gray-300 rounded focus:border-green-500 focus:outline-none text-sm"
                  placeholder="https://example.com/image.jpg">
              </div>
            </div>
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
                *ngIf="getProductImageUrl(product)"
                [src]="getProductImageUrl(product)"
                alt="{{ product.name }}"
                class="w-full h-full object-cover"
                (error)="onImageError($event)">
              <span *ngIf="!getProductImageUrl(product)" class="text-4xl">📦</span>
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
  selectedImageFile: File | null = null;
  imagePreview: string | null = null;

  constructor(
    private productService: ProductService,
    private fb: FormBuilder
  ) {
    this.initForm();
  }

  ngOnInit() {
    console.log('ProductAdminComponent initialized');
    console.log('imagePreview:', this.imagePreview);
    console.log('selectedImageFile:', this.selectedImageFile);
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
        console.log('Products loaded from API:', data);
        console.log('Stock details from API:', data.map(p => ({ name: p.name, stock: p.stockQuantity })));
        console.log('Image URLs from API:', data.map(p => ({ name: p.name, imageUrl: p.imageUrl })));
        
        // ALWAYS use real API data - no more mock data fallback
        this.products = data;
        console.log('Using REAL database products:', this.products.length, 'products loaded');
      },
      error: (err) => {
        console.error('Error loading products from API:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);
        
        // Show error but don't use mock data
        this.errorMessage = 'Failed to load products from database. Please check API connection.';
        this.loading = false;
      }
    });
  }

  useMockData() {
    this.products = [
      {
        id: 1,
        name: "Java Programming Book",
        description: "Complete guide to Java and Spring Boot",
        price: 499.99,
        stockQuantity: 50,
        branch: "CSE",
        category: "BOOKS",
        imageUrl: "https://picsum.photos/seed/java-book/200/200.jpg"
      },
      {
        id: 2,
        name: "Engineering Mathematics",
        description: "Mathematics for engineering students",
        price: 350.00,
        stockQuantity: 30,
        branch: "MECH",
        category: "BOOKS",
        imageUrl: "https://picsum.photos/seed/math-book/200/200.jpg"
      },
      {
        id: 3,
        name: "Civil Engineering Materials",
        description: "Construction and materials guide",
        price: 450.00,
        stockQuantity: 25,
        branch: "CIVIL",
        category: "MATERIALS",
        imageUrl: "https://picsum.photos/seed/civil-materials/200/200.jpg"
      },
      {
        id: 4,
        name: "Digital Electronics",
        description: "Digital circuits and logic design",
        price: 399.00,
        stockQuantity: 40,
        branch: "ECE",
        category: "BOOKS",
        imageUrl: "https://picsum.photos/seed/digital-electronics/200/200.jpg"
      }
    ];
    
    console.log('Mock products loaded:', this.products);
    console.log('Stock details:', this.products.map(p => ({ name: p.name, stock: p.stockQuantity })));
  }

  addProduct() {
    if (this.productForm.invalid) return;

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const productData = this.productForm.value;

    // First create the product
    this.productService.createProduct(productData).subscribe({
      next: (product) => {
        console.log('Product created:', product);

        // If there's an image file, upload it
        if (this.selectedImageFile) {
          this.uploadProductImage(product.id);
        } else {
          this.handleProductCreationSuccess(product);
        }
      },
      error: (err) => {
        console.error('Error creating product:', err);
        this.errorMessage = 'Failed to add product. Please try again.';
        this.loading = false;
      }
    });
  }

  uploadProductImage(productId: number) {
    if (!this.selectedImageFile) return;

    console.log('Uploading image for product ID:', productId);
    console.log('Image file:', this.selectedImageFile);

    this.productService.uploadProductImage(productId, this.selectedImageFile).subscribe({
      next: (response) => {
        console.log('Image upload response:', response);
        console.log('Image uploaded successfully!');
        // Reload products to get updated image URL
        this.loadProducts();
        this.handleProductCreationSuccess();
      },
      error: (err) => {
        console.error('Error uploading image:', err);
        console.error('Error details:', err.error);
        // Still consider product creation successful even if image upload fails
        this.handleProductCreationSuccess();
      }
    });
  }

  handleProductCreationSuccess(product?: Product) {
    if (product) {
      // If we have an uploaded image, update the product's imageUrl
      if (this.selectedImageFile && !product.imageUrl) {
        product.imageUrl = `http://localhost:8089/api/products/${product.id}/image`;
        console.log('Set product image URL:', product.imageUrl);
      }
      this.products.push(product);
    }
    this.resetForm();
    this.successMessage = 'Product added successfully! ✅';
    this.loading = false;
    setTimeout(() => this.successMessage = '', 3000);
  }

  onImageSelect(event: any): void {
    console.log('onImageSelect called');
    console.log('Event:', event);
    console.log('Files:', event.target.files);

    const file = event.target.files[0];
    if (file) {
      console.log('File selected:', file);
      console.log('File type:', file.type);
      console.log('File size:', file.size);

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Please select an image file';
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'Image size should be less than 5MB';
        return;
      }

      this.selectedImageFile = file;
      this.imagePreview = URL.createObjectURL(file);
      console.log('Image preview set:', this.imagePreview);
      this.errorMessage = ''; // Clear any previous error
    }
  }

  removeImage(): void {
    this.selectedImageFile = null;
    if (this.imagePreview) {
      URL.revokeObjectURL(this.imagePreview);
      this.imagePreview = null;
    }
    // Clear the file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  resetForm(): void {
    this.productForm.reset();
    this.removeImage();
  }

  getProductImageUrl(product: Product): string {
    console.log('Getting image URL for product:', product.name, 'URL:', product.imageUrl);
    
    if (product.imageUrl) {
      // If it's already a full URL to an external service, return as is
      if (product.imageUrl.startsWith('https://picsum.photos') || 
          product.imageUrl.startsWith('https://example.com') ||
          product.imageUrl.startsWith('http') && !product.imageUrl.includes('localhost')) {
        console.log('Using external URL:', product.imageUrl);
        return product.imageUrl;
      }
      
      // If it's a localhost URL with wrong port, fix the port to match your API
      if (product.imageUrl.includes('localhost')) {
        // Fix any port to 8089 (your API port)
        const fixedUrl = product.imageUrl.replace(/:\d+/, ':8089');
        console.log('Fixed localhost URL:', product.imageUrl, '->', fixedUrl);
        return fixedUrl;
      }
      
      // If it's a relative path starting with /, construct full URL
      if (product.imageUrl.startsWith('/')) {
        const fullUrl = `http://localhost:8089${product.imageUrl}`;
        console.log('Constructed URL from relative path:', fullUrl);
        return fullUrl;
      }
      
      // If it's just a filename or relative path without /, construct full URL
      const fullUrl = `http://localhost:8089/api/products/${product.id}/image`;
      console.log('Constructed URL:', fullUrl);
      return fullUrl;
    }
    console.log('No image URL found');
    return '';
  }

  ngOnDestroy(): void {
    // Clean up any object URLs to prevent memory leaks
    if (this.imagePreview) {
      URL.revokeObjectURL(this.imagePreview);
    }
  }

  onImageError(event: any): void {
    // If image fails to load, hide it and show placeholder
    event.target.style.display = 'none';
    const parent = event.target.parentElement;
    if (parent) {
      const placeholder = parent.querySelector('span');
      if (placeholder) {
        placeholder.style.display = 'block';
      }
    }
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
