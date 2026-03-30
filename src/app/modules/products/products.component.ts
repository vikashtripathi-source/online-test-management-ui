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
  branches = ['All', 'CSE', 'ECE', 'Mechanical', 'Civil'];
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
    this.productService.getAll().subscribe({
      next: (data) => {
        this.products = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.error = 'Failed to load products';
        this.loading = false;
      }
    });
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
    this.selectedProduct = product;
    this.showProductDetail = true;
    this.addedToCart = false;
  }

  closeProductDetail(): void {
    this.showProductDetail = false;
    this.selectedProduct = null;
  }

  addToCart(product: Product): void {
    this.orderService.addToCart(product);
    this.updateCartCount();
    this.addedToCart = true;
    setTimeout(() => {
      this.addedToCart = false;
    }, 2000);
  }

  updateCartCount(): void {
    this.orderService.getCart().subscribe(cart => {
      this.cartCount = cart.length;
    });
  }

  isOutOfStock(product: Product): boolean {
    return product.stockQuantity <= 0;
  }

  getLowStockClass(product: Product): string {
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
}
