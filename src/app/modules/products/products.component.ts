import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../../shared/services/product.service';
import { OrderService } from '../../shared/services/order.service';
import { StudentService } from '../../shared/services/student.service';
import { Product } from '../../core/models/product.model';
import { Student } from '../../core/models/student.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  currentStudent: Student | null = null;
  selectedCategory = 'All';
  searchQuery = '';
  loading = true;
  error: string | null = null;
  cartCount = 0;
  selectedProduct: Product | null = null;
  showProductDetail = false;
  addedToCart = false;
  branches = ['All', 'CSE', 'ECE', 'MECH', 'CIVIL'];
  selectedBranch = 'All';

  constructor(
    private productService: ProductService,
    private orderService: OrderService,
    private studentService: StudentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.studentService.getCurrentStudent().subscribe(student => {
      this.currentStudent = student;
    });

    this.loadProducts();
    this.updateCartCount();
  }

  loadProducts(): void {
    console.log('Loading products from API...');
    this.productService.getAll().subscribe({
      next: (data) => {
        console.log('Products loaded successfully:', data);
        console.log('Product stock details:', data.map(p => ({ name: p.name, stock: p.stockQuantity })));
        console.log('Product image URLs:', data.map(p => ({ name: p.name, imageUrl: p.imageUrl })));
        
        // ALWAYS use real API data - no more mock data fallback
        this.products = data;
        this.applyFilters();
        this.loading = false;
        
        console.log('Using REAL database products:', this.products.length, 'products loaded');
      },
      error: (err) => {
        console.error('Error loading products:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);
        
        // Show error but don't use mock data
        this.error = 'Failed to load products from database. Please check API connection.';
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
        stockQuantity: 75,
        branch: "CSE",
        category: "BOOKS",
        imageUrl: "https://picsum.photos/seed/java-book/200/200.jpg"
      },
      {
        id: 2,
        name: "Engineering Mathematics",
        description: "Mathematics for engineering students",
        price: 350.00,
        stockQuantity: 60,
        branch: "MECH",
        category: "BOOKS",
        imageUrl: "https://picsum.photos/seed/math-book/200/200.jpg"
      },
      {
        id: 3,
        name: "Civil Engineering Materials",
        description: "Construction and materials guide",
        price: 450.00,
        stockQuantity: 45,
        branch: "CIVIL",
        category: "MATERIALS",
        imageUrl: "https://picsum.photos/seed/civil-materials/200/200.jpg"
      },
      {
        id: 4,
        name: "Digital Electronics",
        description: "Digital circuits and logic design",
        price: 399.00,
        stockQuantity: 55,
        branch: "ECE",
        category: "BOOKS",
        imageUrl: "https://picsum.photos/seed/digital-electronics/200/200.jpg"
      },
      {
        id: 5,
        name: "Data Structures Handbook",
        description: "Comprehensive guide to data structures and algorithms",
        price: 425.00,
        stockQuantity: 80,
        branch: "CSE",
        category: "BOOKS",
        imageUrl: "https://picsum.photos/seed/data-structures/200/200.jpg"
      },
      {
        id: 6,
        name: "Thermodynamics Guide",
        description: "Engineering thermodynamics and heat transfer",
        price: 380.00,
        stockQuantity: 35,
        branch: "MECH",
        category: "GUIDES",
        imageUrl: "https://picsum.photos/seed/thermodynamics/200/200.jpg"
      }
    ];
    
    console.log('Mock products created:', this.products);
    console.log('Stock details:', this.products.map(p => ({ name: p.name, stock: p.stockQuantity })));
    this.applyFilters();
    this.loading = false;
  }

  applyFilters(): void {
    let filtered = this.products;

    if (this.selectedBranch !== 'All') {
      filtered = filtered.filter(p => p.branch === this.selectedBranch);
    }

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    this.filteredProducts = filtered;
  }

  onBranchChange(): void {
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  viewProductDetail(product: Product): void {
    console.log('Viewing product detail:', product);
    console.log('Product stock quantity:', product.stockQuantity);
    console.log('Product stock type:', typeof product.stockQuantity);
    console.log('Is out of stock:', this.isOutOfStock(product));
    console.log('Stock class:', this.getLowStockClass(product));
    
    this.selectedProduct = product;
    this.showProductDetail = true;
    this.addedToCart = false;
  }

  closeProductDetail(): void {
    this.showProductDetail = false;
    this.selectedProduct = null;
  }

  addToCart(product: Product): void {
    console.log('=== ADD TO CART DEBUG ===');
    console.log('Adding to cart - Product:', product);
    console.log('Stock quantity:', product.stockQuantity);
    console.log('Is out of stock:', this.isOutOfStock(product));
    console.log('Product ID:', product.id);
    console.log('Product name:', product.name);
    
    // Check if product is actually out of stock
    if (this.isOutOfStock(product)) {
      console.error('Cannot add to cart: Product is out of stock');
      return;
    }
    
    console.log('Calling orderService.addToCart...');
    this.orderService.addToCart(product);
    
    console.log('Updating cart count...');
    this.updateCartCount();
    
    console.log('Setting addedToCart flag...');
    this.addedToCart = true;
    setTimeout(() => {
      this.addedToCart = false;
      console.log('Reset addedToCart flag');
    }, 2000);
    
    console.log('=== ADD TO CART COMPLETE ===');
  }

  updateCartCount(): void {
    console.log('=== UPDATE CART COUNT ===');
    this.orderService.getCart().subscribe(cart => {
      console.log('Cart from service:', cart);
      console.log('Cart length:', cart.length);
      this.cartCount = cart.length;
      console.log('Cart count set to:', this.cartCount);
      console.log('=== UPDATE CART COUNT COMPLETE ===');
    });
  }

  getProductImageUrl(product: Product): string {
    if (product.imageUrl) {
      console.log('Getting image URL for product:', product.name, 'URL:', product.imageUrl);
      
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
    console.log('No image URL found for product:', product.name);
    return '';
  }

  isOutOfStock(product: Product): boolean {
    return product.stockQuantity <= 0;
  }

  getStockDisplayText(product: Product): string {
    if (product.stockQuantity === -1) {
      return 'Updating...';
    }
    return `${product.stockQuantity} in stock`;
  }

  getLowStockClass(product: Product): string {
    if (product.stockQuantity === -1) return 'updating-stock';
    if (product.stockQuantity <= 0) return 'out-of-stock';
    if (product.stockQuantity <= 5) return 'low-stock';
    return '';
  }

  goToCart(): void {
    this.router.navigate(['/orders']);
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  testCart(): void {
    console.log('=== TEST CART FUNCTION ===');
    
    // Create a test product
    const testProduct = {
      id: 999,
      name: 'Test Product',
      price: 100,
      stockQuantity: 50,
      description: 'Test description'
    };
    
    console.log('Adding test product to cart:', testProduct);
    this.orderService.addToCart(testProduct);
    this.updateCartCount();
    
    console.log('Test cart complete');
    console.log('=== TEST CART FUNCTION COMPLETE ===');
  }

  fixAllZeroStock(): void {
    console.log('Fixing all zero stock products...');
    this.productService.fixZeroStockProducts().subscribe({
      next: (updatedProducts) => {
        console.log('Stock fixed successfully:', updatedProducts);
        this.products = updatedProducts;
        this.applyFilters();
        console.log('Updated stock details:', this.products.map(p => ({ name: p.name, stock: p.stockQuantity })));
      },
      error: (err) => {
        console.error('Error fixing stock:', err);
        this.error = 'Failed to fix stock quantities. Please try again.';
      }
    });
  }

  fixProductStock(product: Product): void {
    console.log('Fixing stock for product:', product.name, 'ID:', product.id);
    
    // Show immediate feedback
    const index = this.products.findIndex(p => p.id === product.id);
    if (index !== -1) {
      // Temporarily show "Updating..." to give immediate feedback
      this.products[index] = { ...this.products[index], stockQuantity: -1 }; // -1 indicates updating
      this.applyFilters();
    }
    
    this.productService.updateStock(product.id, 50).subscribe({
      next: (updatedProduct) => {
        console.log('Stock fixed successfully for product:', updatedProduct);
        // Update the product in the local array
        const updatedIndex = this.products.findIndex(p => p.id === product.id);
        if (updatedIndex !== -1) {
          this.products[updatedIndex] = { ...this.products[updatedIndex], stockQuantity: 50 };
          this.applyFilters();
          console.log('Product stock updated in UI:', this.products[updatedIndex]);
        }
      },
      error: (err) => {
        console.error('Error fixing product stock:', err);
        // Revert the temporary state
        const revertIndex = this.products.findIndex(p => p.id === product.id);
        if (revertIndex !== -1) {
          this.products[revertIndex] = { ...this.products[revertIndex], stockQuantity: 0 };
          this.applyFilters();
        }
        this.error = `Failed to fix stock for ${product.name}`;
      }
    });
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
}
