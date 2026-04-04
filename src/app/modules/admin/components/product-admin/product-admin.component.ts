import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../../../shared/services/product.service';
import { Product, ProductRequest } from '../../../../core/models/product.model';

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
              <option value="EC">EC</option>
              <option value="IT">IT</option>
              <option value="MECHANICAL">MECHANICAL</option>
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

      <!-- Update Product Form -->
      <div *ngIf="showUpdateForm && editingProduct" id="update-form" class="bg-white rounded-lg shadow-lg p-8 mb-8 border-2 border-blue-200">
        <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span>📝</span> Update Product: {{ editingProduct.name || editingProduct.productName }}
        </h2>

        <form [formGroup]="updateForm" (ngSubmit)="updateProduct()" class="space-y-6">
          <!-- Product Name -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Product Name *</label>
            <input
              type="text"
              formControlName="name"
              class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              placeholder="Enter product name">
            <p class="text-red-500 text-sm mt-1" *ngIf="isUpdateFieldInvalid('name')">
              Product name is required
            </p>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
            <textarea
              formControlName="description"
              rows="3"
              class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              placeholder="Enter product description..."></textarea>
          </div>

          <!-- Price and Stock -->
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Price ($) *</label>
              <input
                type="number"
                formControlName="price"
                class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="0.00">
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Stock Quantity *</label>
              <input
                type="number"
                formControlName="stockQuantity"
                class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="0">
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
              <select
                formControlName="category"
                class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
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
              class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
              <option value="">Select Branch</option>
              <option value="CSE">CSE</option>
              <option value="EC">EC</option>
              <option value="IT">IT</option>
              <option value="MECHANICAL">MECHANICAL</option>
            </select>
          </div>

          <!-- Image Upload -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Update Product Image</label>
            <div class="space-y-3">
              <!-- Current Image Preview -->
              <div *ngIf="updateImagePreview" class="mt-2">
                <p class="text-sm text-gray-600 mb-2">Current/New Image:</p>
                <img
                  [src]="updateImagePreview"
                  alt="Product preview"
                  class="h-32 w-32 object-cover rounded-lg border-2 border-gray-300">
                <button
                  type="button"
                  (click)="removeUpdateImage()"
                  class="ml-2 text-red-600 hover:text-red-800 text-sm">
                  Remove New Image
                </button>
              </div>

              <!-- File Upload -->
              <div>
                <input
                  id="updateImageInput"
                  type="file"
                  (change)="onUpdateImageSelect($event)"
                  accept="image/*"
                  class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
              </div>

              <!-- Fallback URL Input -->
              <div class="text-sm text-gray-600">
                <p>Or enter image URL manually:</p>
                <input
                  type="url"
                  formControlName="imageUrl"
                  class="w-full px-3 py-1 border border-gray-300 rounded focus:border-blue-500 focus:outline-none text-sm"
                  placeholder="https://example.com/image.jpg">
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-4">
            <button
              type="submit"
              [disabled]="!updateForm.valid || updating"
              class="flex-1 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-bold py-3 rounded-lg transition disabled:opacity-50">
              {{ updating ? '⏳ Updating...' : '📝 Update Product' }}
            </button>
            <button
              type="button"
              (click)="cancelUpdate()"
              class="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition">
              ✕ Cancel
            </button>
          </div>

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
                alt="{{ product.name || product.productName }}"
                class="w-full h-full object-cover"
                (error)="onImageError($event)">
              <span *ngIf="!getProductImageUrl(product)" class="text-4xl">📦</span>
            </div>

            <div class="p-4">
              <h3 class="text-lg font-bold text-gray-800 mb-2">{{ product.name || product.productName }}</h3>
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

              <div class="flex gap-2 mb-4">
                <button
                  (click)="editProduct(product)"
                  class="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition text-sm font-semibold">
                  📝 Edit
                </button>
                <button
                  (click)="deleteProduct(product.id)"
                  class="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition text-sm font-semibold">
                  🗑️ Delete
                </button>
              </div>
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
  updateForm!: FormGroup;
  loading = false;
  updating = false;
  successMessage = '';
  errorMessage = '';
  searchTerm = '';
  selectedCategory = '';
  selectedImageFile: File | null = null;
  updateImageFile: File | null = null;
  imagePreview: string | null = null;
  updateImagePreview: string | null = null;
  editingProduct: Product | null = null;
  showUpdateForm = false;

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

    this.updateForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      stockQuantity: ['', [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      branch: ['', Validators.required],
      imageUrl: ['']
    });
  }

  // Update Product Methods
  editProduct(product: Product) {
    this.editingProduct = product;
    this.showUpdateForm = true;
    
    // Populate update form with product data
    this.updateForm.patchValue({
      name: product.name || product.productName,
      description: product.description,
      price: product.price,
      stockQuantity: product.stockQuantity,
      category: product.category,
      branch: product.branch,
      imageUrl: product.imageUrl || ''
    });
    
    // Set current image preview if exists
    if (product.imageUrl) {
      this.updateImagePreview = this.getProductImageUrl(product);
    }
    
    // Scroll to update form
    setTimeout(() => {
      document.getElementById('update-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  cancelUpdate() {
    this.editingProduct = null;
    this.showUpdateForm = false;
    this.updateForm.reset();
    this.updateImageFile = null;
    if (this.updateImagePreview) {
      URL.revokeObjectURL(this.updateImagePreview);
      this.updateImagePreview = null;
    }
  }

  onUpdateImageSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
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

      this.updateImageFile = file;
      this.updateImagePreview = URL.createObjectURL(file);
      this.errorMessage = '';
    }
  }

  removeUpdateImage(): void {
    this.updateImageFile = null;
    if (this.updateImagePreview && this.updateImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(this.updateImagePreview);
    }
    this.updateImagePreview = this.editingProduct?.imageUrl || null;
    // Clear the file input
    const fileInput = document.querySelector('#updateImageInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  updateProduct() {
    if (this.updateForm.invalid || !this.editingProduct) return;

    this.updating = true;
    this.successMessage = '';
    this.errorMessage = '';

    const productData: ProductRequest = {
      productName: this.updateForm.value.name,
      description: this.updateForm.value.description,
      price: this.updateForm.value.price,
      stockQuantity: this.updateForm.value.stockQuantity,
      category: this.updateForm.value.category,
      branch: this.updateForm.value.branch,
      imageUrl: this.updateForm.value.imageUrl,
      active: true
    };

    console.log('Updating product:', this.editingProduct!.id);

    const updatedProduct: Product = {
      ...this.editingProduct!,
      name: productData.productName,
      productName: productData.productName,
      description: productData.description,
      price: productData.price,
      stockQuantity: productData.stockQuantity,
      category: productData.category,
      branch: productData.branch,
      imageUrl: productData.imageUrl,
      active: productData.active
    };

    this.productService.updateProduct(this.editingProduct!.id, updatedProduct).subscribe({
      next: (updatedProduct) => {
        const index = this.products.findIndex(p => p.id === this.editingProduct!.id);
        if (index !== -1) {
          this.products[index] = updatedProduct;
        }
        
        if (this.updateImageFile) {
          this.uploadUpdatedProductImage(this.editingProduct!.id);
        } else {
          this.handleProductUpdateSuccess();
        }
      },
      error: (err) => {
        console.error('Error updating product:', err);
        this.errorMessage = 'Failed to update product. Please try again.';
        this.updating = false;
      }
    });
  }

  uploadUpdatedProductImage(productId: number) {
    if (!this.updateImageFile) return;

    this.productService.updateProductImage(productId, this.updateImageFile).subscribe({
      next: (response) => {
        this.loadProducts();
        this.handleProductUpdateSuccess();
      },
      error: (err) => {
        console.error('Error updating image:', err);
        this.handleProductUpdateSuccess();
      }
    });
  }

  handleProductUpdateSuccess() {
    this.cancelUpdate();
    this.successMessage = 'Product updated successfully! ✅';
    this.updating = false;
    setTimeout(() => this.successMessage = '', 3000);
  }

  loadProducts() {
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;
      },
      error: (err) => {
        console.error('Error loading products from API:', err);
        this.errorMessage = 'Failed to load products from database. Please check API connection.';
        this.loading = false;
      }
    });
  }


  addProduct() {
    if (this.productForm.invalid) return;

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const productData: ProductRequest = {
      productName: this.productForm.value.name,
      description: this.productForm.value.description,
      price: this.productForm.value.price,
      stockQuantity: this.productForm.value.stockQuantity,
      category: this.productForm.value.category,
      branch: this.productForm.value.branch,
      imageUrl: this.productForm.value.imageUrl,
      active: true
    };

    this.productService.createProduct(productData).subscribe({
      next: (product) => {
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

    this.productService.uploadProductImage(productId, this.selectedImageFile).subscribe({
      next: (response) => {
        this.loadProducts();
        this.handleProductCreationSuccess();
      },
      error: (err) => {
        console.error('Error uploading image:', err);
        this.handleProductCreationSuccess();
      }
    });
  }

  handleProductCreationSuccess(product?: Product) {
    if (product) {
      if (this.selectedImageFile && !product.imageUrl) {
        product.imageUrl = `http://localhost:8089/api/products/${product.id}/image`;
      }
      this.products.push(product);
    }
    this.resetForm();
    this.successMessage = 'Product added successfully! ✅';
    this.loading = false;
    setTimeout(() => this.successMessage = '', 3000);
  }

  onImageSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Please select an image file';
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'Image size should be less than 5MB';
        return;
      }

      this.selectedImageFile = file;
      this.imagePreview = URL.createObjectURL(file);
      this.errorMessage = '';
    }
  }

  removeImage(): void {
    this.selectedImageFile = null;
    if (this.imagePreview) {
      URL.revokeObjectURL(this.imagePreview);
      this.imagePreview = null;
    }
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
    const productName = product.name || product.productName;
    
    if (product.imageUrl) {
      if (product.imageUrl.startsWith('https://picsum.photos') || 
          product.imageUrl.startsWith('https://example.com') ||
          product.imageUrl.startsWith('http') && !product.imageUrl.includes('localhost')) {
        return product.imageUrl;
      }
      
      if (product.imageUrl.includes('localhost')) {
        const fixedUrl = product.imageUrl.replace(/:\d+/, ':8089');
        return fixedUrl;
      }
      
      if (product.imageUrl.startsWith('/')) {
        const fullUrl = `http://localhost:8089${product.imageUrl}`;
        return fullUrl;
      }
      
      const fullUrl = `http://localhost:8089/api/products/${product.id}/image`;
      return fullUrl;
    }
    return '';
  }

  ngOnDestroy(): void {
    if (this.imagePreview) {
      URL.revokeObjectURL(this.imagePreview);
    }
    if (this.updateImagePreview && this.updateImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(this.updateImagePreview);
    }
  }

  onImageError(event: any): void {
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
    return this.products.filter(p => {
      const productName = p.name || p.productName || '';
      return (productName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
       p.description.toLowerCase().includes(this.searchTerm.toLowerCase())) &&
      (!this.selectedCategory || p.category === this.selectedCategory);
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isUpdateFieldInvalid(fieldName: string): boolean {
    const field = this.updateForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
