import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../../shared/services/product.service';
import { OrderService } from '../../shared/services/order.service';
import { StudentService } from '../../shared/services/student.service';
import { StockErrorHandlerService } from '../../shared/services/stock-error-handler.service';
import { Product } from '../../core/models/product.model';
import { Student } from '../../core/models/student.model';
import { forkJoin } from 'rxjs';

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
  showCartNotification = false;
  cartNotificationProduct: Product | null = null;
  branches = ['All', 'CSE', 'EC', 'IT', 'MECHANICAL'];
  selectedBranch = 'All';

  constructor(
    private productService: ProductService,
    private orderService: OrderService,
    private studentService: StudentService,
    private stockErrorHandler: StockErrorHandlerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.studentService.getCurrentStudent().subscribe(student => {
      this.currentStudent = student;
      console.log('=== PRODUCTS COMPONENT STUDENT DEBUG ===');
      console.log('Current student:', student);
      if (student) {
        console.log('Student ID:', student.id);
        console.log('Setting current student ID in order service...');
        this.orderService.setCurrentStudent(student.id);
        console.log('Student ID set successfully');
      } else {
        console.log('No current student found - user may not be logged in');
      }
    });

    this.loadProducts();
    this.updateCartCount();
  }

  loadProducts(): void {
    console.log('Loading products from API...');
    this.productService.getAll().subscribe({
      next: (data) => {
        console.log('Raw API response:', data);
        
        // Map API response to frontend model and fix data issues
        this.products = data.map(item => ({
          id: item.id,
          name: item.productName || item.name || `Product ${item.id}`, // Handle missing names
          description: item.description || 'No description available',
          price: item.price || 0,
          stockQuantity: item.stockQuantity || 0,
          branch: item.branch || 'CSE', // Default to CSE if not specified
          category: item.category || 'GENERAL',
          imageUrl: item.imageUrl || '',
          active: item.active !== false // Default to true unless explicitly false
        }));
        
        console.log('Mapped products:', this.products);
        console.log('Product stock details:', this.products.map(p => ({ name: p.name, stock: p.stockQuantity, active: p.active })));
        console.log('Product image URLs:', this.products.map(p => ({ name: p.name, imageUrl: p.imageUrl })));
        
        this.applyFilters();
        this.loading = false;
        
        console.log('Using REAL database products:', this.products.length, 'products loaded');
        console.log('Displaying filtered products:', this.filteredProducts.length, 'products');
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
        branch: "MECHANICAL",
        category: "BOOKS",
        imageUrl: "https://picsum.photos/seed/math-book/200/200.jpg"
      },
      {
        id: 3,
        name: "Digital Electronics",
        description: "Digital circuits and logic design",
        price: 399.00,
        stockQuantity: 55,
        branch: "EC",
        category: "BOOKS",
        imageUrl: "https://picsum.photos/seed/digital-electronics/200/200.jpg"
      },
      {
        id: 4,
        name: "Data Structures Handbook",
        description: "Comprehensive guide to data structures and algorithms",
        price: 425.00,
        stockQuantity: 80,
        branch: "CSE",
        category: "BOOKS",
        imageUrl: "https://picsum.photos/seed/data-structures/200/200.jpg"
      },
      {
        id: 5,
        name: "Network Security Guide",
        description: "Comprehensive network security principles and practices",
        price: 450.00,
        stockQuantity: 45,
        branch: "IT",
        category: "BOOKS",
        imageUrl: "https://picsum.photos/seed/network-security/200/200.jpg"
      },
      {
        id: 6,
        name: "Thermodynamics Guide",
        description: "Engineering thermodynamics and heat transfer",
        price: 380.00,
        stockQuantity: 35,
        branch: "MECHANICAL",
        category: "GUIDES",
        imageUrl: "https://picsum.photos/seed/thermodynamics/200/200.jpg"
      },
      {
        id: 7,
        name: "Circuit Analysis",
        description: "Fundamentals of electric circuit analysis",
        price: 420.00,
        stockQuantity: 50,
        branch: "EC",
        category: "BOOKS",
        imageUrl: "https://picsum.photos/seed/circuit-analysis/200/200.jpg"
      },
      {
        id: 8,
        name: "Database Management Systems",
        description: "Complete guide to database design and SQL",
        price: 440.00,
        stockQuantity: 65,
        branch: "IT",
        category: "BOOKS",
        imageUrl: "https://picsum.photos/seed/database-systems/200/200.jpg"
      }
    ];
    
    console.log('Mock products created:', this.products);
    console.log('Stock details:', this.products.map(p => ({ name: p.name, stock: p.stockQuantity })));
    this.applyFilters();
    this.loading = false;
  }

  applyFilters(): void {
    let filtered = this.products;
    console.log('=== APPLY FILTERS DEBUG ===');
    console.log('Original products:', this.products);
    console.log('Original products length:', this.products.length);

    // Remove duplicates based on name, description, and price
    filtered = this.removeDuplicates(filtered);
    console.log('After removing duplicates:', filtered);
    console.log('After removing duplicates length:', filtered.length);

    // TEMPORARILY COMMENT OUT INACTIVE FILTER TO SHOW ALL PRODUCTS
    // Filter out inactive products
    // filtered = filtered.filter(p => p.active !== false);
    console.log('After filtering inactive products (SKIPPED):', filtered);
    console.log('After filtering inactive products length (SKIPPED):', filtered.length);

    if (this.selectedBranch !== 'All') {
      filtered = filtered.filter(p => p.branch === this.selectedBranch);
      console.log('After branch filter:', filtered);
    }

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
      console.log('After search filter:', filtered);
    }

    this.filteredProducts = filtered;
    console.log('Final filtered products:', this.filteredProducts);
    console.log('Final filtered products length:', this.filteredProducts.length);
    console.log('=== APPLY FILTERS DEBUG COMPLETE ===');
  }

  private removeDuplicates(products: Product[]): Product[] {
    const seen = new Set();
    return products.filter(product => {
      // Create a unique key based on name, description, and price
      const key = `${product.name}|${product.description}|${product.price}`;
      if (seen.has(key)) {
        console.log('Removing duplicate product:', product.name);
        return false;
      }
      seen.add(key);
      return true;
    });
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
    console.log('Current student:', this.currentStudent);
    console.log('Adding to cart - Product:', product);
    console.log('Stock quantity:', product.stockQuantity);
    console.log('Is out of stock:', this.isOutOfStock(product));
    console.log('Product ID:', product.id);
    console.log('Product name:', product.name);
    
    // Check if product is actually out of stock
    if (this.isOutOfStock(product)) {
      console.error('Cannot add to cart: Product is out of stock');
      this.showError('This product is out of stock');
      return;
    }
    
    if (this.currentStudent) {
      console.log('Using backend cart API with stock validation...');
      console.log('Student ID:', this.currentStudent.id);
      console.log('Product ID:', product.id);
      const apiUrl = `${this.orderService['ordersBaseUrl']}/cart/add?studentId=${this.currentStudent.id}&productId=${product.id}&quantity=1`;
      console.log('API URL:', apiUrl);
      
      this.orderService.addToCart(product.id, 1).subscribe({
        next: (response) => {
          console.log('Product added to cart successfully with stock update:', response);
          this.updateCartCount();
          this.addedToCart = true;
          this.showCartNotification = true;
          this.cartNotificationProduct = product;
          
          // Update local product stock to reflect backend changes
          const productIndex = this.products.findIndex(p => p.id === product.id);
          if (productIndex !== -1) {
            // Temporarily show stock is updating
            this.products[productIndex] = { ...this.products[productIndex], stockQuantity: -1 };
            this.applyFilters();
            
            // Refresh product data to get updated stock
            setTimeout(() => {
              this.loadProducts();
            }, 500);
          }
          
          // Auto-hide notification after 4 seconds
          setTimeout(() => {
            this.addedToCart = false;
            this.showCartNotification = false;
            this.cartNotificationProduct = null;
          }, 4000);
        },
        error: (error) => {
          console.error('Error adding to cart:', error);
          
          // Use the stock error handler for better error messages
          const errorResponse = this.stockErrorHandler.createErrorResponse(
            this.stockErrorHandler.parseStockError(error)
          );
          
          this.showError(errorResponse.message);
          
          // Show suggestion if available
          if (errorResponse.suggestion) {
            setTimeout(() => {
              this.showError(errorResponse.suggestion);
            }, 3500);
          }
          
          // Refresh stock to show current availability for stock-related errors
          if (errorResponse.title === 'Insufficient Stock') {
            this.loadProducts();
          }
          
          // Fallback to legacy method only for non-stock related errors
          if (!error.error?.message?.includes('stock') && !error.error?.message?.includes('active')) {
            console.log('Falling back to legacy cart method...');
            this.orderService.addToCartLegacy(product);
            this.updateCartCount();
            this.addedToCart = true;
            this.showCartNotification = true;
            this.cartNotificationProduct = product;
            
            setTimeout(() => {
              this.addedToCart = false;
              this.showCartNotification = false;
              this.cartNotificationProduct = null;
            }, 4000);
          }
        }
      });
    } else {
      console.log('No current student, using legacy cart method...');
      this.orderService.addToCartLegacy(product);
      this.updateCartCount();
      this.addedToCart = true;
      this.showCartNotification = true;
      this.cartNotificationProduct = product;
      
      setTimeout(() => {
        this.addedToCart = false;
        this.showCartNotification = false;
        this.cartNotificationProduct = null;
      }, 4000);
    }
    
    console.log('=== ADD TO CART COMPLETE ===');
  }

  private showError(message: string): void {
    this.error = message;
    setTimeout(() => {
      this.error = null;
    }, 3000);
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
          (product.imageUrl.startsWith('http') && !product.imageUrl.includes('localhost'))) {
        console.log('Using external URL:', product.imageUrl);
        return product.imageUrl;
      }
      
      // Fix localhost URLs with wrong ports
      if (product.imageUrl.includes('localhost')) {
        // Extract the path and construct correct URL
        const urlMatch = product.imageUrl.match(/localhost:\d+(\/.+)/);
        if (urlMatch) {
          const fixedUrl = `http://localhost:8089${urlMatch[1]}`;
          console.log('Fixed localhost URL:', product.imageUrl, '->', fixedUrl);
          return fixedUrl;
        }
        // Fallback: just fix the port
        const fixedUrl = product.imageUrl.replace(/:\d+/, ':8089');
        console.log('Fixed localhost port:', product.imageUrl, '->', fixedUrl);
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
    
    // Return placeholder image for products without images
    console.log('No image URL found for product:', product.name, 'using placeholder');
    return `https://picsum.photos/seed/product-${product.id}/200/200.jpg`;
  }

  isOutOfStock(product: Product): boolean {
    // Only check stock quantity, not active status (since we're showing inactive products)
    return product.stockQuantity <= 0;
  }

  getStockDisplayText(product: Product): string {
    if (product.stockQuantity === -1) return 'Updating...';
    if (product.stockQuantity <= 0) return 'Out of Stock';
    return `${product.stockQuantity} in stock`;
  }

  getLowStockClass(product: Product): string {
    if (product.active === false) return 'out-of-stock';
    if (product.stockQuantity === -1) return 'updating-stock';
    if (product.stockQuantity <= 0) return 'out-of-stock';
    if (product.stockQuantity <= 5) return 'low-stock';
    return '';
  }

  goToCart(): void {
    this.router.navigate(['/orders']);
  }

  goToCartQuick(): void {
    this.showCartNotification = false;
    this.cartNotificationProduct = null;
    this.router.navigate(['/orders']);
  }

  closeCartNotification(): void {
    this.showCartNotification = false;
    this.cartNotificationProduct = null;
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  testCart(): void {
    console.log('=== TEST CART FUNCTION ===');
    
    if (this.currentStudent) {
      console.log('Testing with backend cart API...');
      // Use a real product ID from your database
      this.orderService.addToCart(1, 1).subscribe({
        next: (response) => {
          console.log('Test cart addition successful:', response);
          this.updateCartCount();
        },
        error: (error) => {
          console.error('Test cart addition failed:', error);
          console.log('Falling back to legacy test...');
          this.testCartLegacy();
        }
      });
    } else {
      console.log('No current student, using legacy test...');
      this.testCartLegacy();
    }
    
    console.log('=== TEST CART FUNCTION COMPLETE ===');
  }

  private testCartLegacy(): void {
    // Create a test product
    const testProduct = {
      id: 999,
      name: 'Test Product',
      price: 100,
      stockQuantity: 50,
      description: 'Test description'
    };
    
    console.log('Adding test product to cart:', testProduct);
    this.orderService.addToCartLegacy(testProduct);
    this.updateCartCount();
    
    console.log('Test cart complete');
  }

  fixAllZeroStock(): void {
    console.log('Fixing all zero stock products...');
    
    // Show immediate feedback
    this.products.forEach(product => {
      if (product.stockQuantity <= 0) {
        product.stockQuantity = -1; // -1 indicates updating
      }
    });
    this.applyFilters();
    
    this.productService.fixZeroStockProducts().subscribe({
      next: (updatedProducts) => {
        console.log('Stock fixed successfully:', updatedProducts);
        // Map the updated products back to our format
        this.products = updatedProducts.map(item => ({
          id: item.id,
          name: item.productName || item.name || `Product ${item.id}`,
          description: item.description || 'No description available',
          price: item.price || 0,
          stockQuantity: item.stockQuantity || 50,
          branch: item.branch || 'Unknown',
          category: item.category || 'GENERAL',
          imageUrl: item.imageUrl || '',
          active: item.active !== false
        }));
        this.applyFilters();
        console.log('Updated stock details:', this.products.map(p => ({ name: p.name, stock: p.stockQuantity })));
      },
      error: (err) => {
        console.error('Error fixing stock:', err);
        // Revert the updating state
        this.products.forEach(product => {
          if (product.stockQuantity === -1) {
            product.stockQuantity = 0;
          }
        });
        this.applyFilters();
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

  // Add method to activate all inactive products
  activateAllProducts(): void {
    console.log('Activating all inactive products...');
    
    const inactiveProducts = this.products.filter(p => p.active === false);
    if (inactiveProducts.length === 0) {
      console.log('No inactive products to activate');
      return;
    }
    
    console.log('Found', inactiveProducts.length, 'inactive products to activate');
    
    // Update each inactive product
    const activationRequests = inactiveProducts.map(product => 
      this.productService.updateProduct(product.id, { ...product, active: true })
    );
    
    forkJoin(activationRequests).subscribe({
      next: (updatedProducts) => {
        console.log('All products activated successfully:', updatedProducts);
        // Update local products
        updatedProducts.forEach((updatedProduct, index) => {
          const localIndex = this.products.findIndex(p => p.id === updatedProduct.id);
          if (localIndex !== -1) {
            this.products[localIndex] = { ...this.products[localIndex], active: true };
          }
        });
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error activating products:', err);
        this.error = 'Failed to activate some products. Please try again.';
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
