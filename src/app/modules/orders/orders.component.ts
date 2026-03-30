import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderService } from '../../shared/services/order.service';
import { AddressService } from '../../shared/services/address.service';
import { StudentService } from '../../shared/services/student.service';
import { Order, OrderItem } from '../../core/models/order.model';
import { Address } from '../../core/models/address.model';
import { Product } from '../../core/models/product.model';
import { Student } from '../../core/models/student.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  cart: Product[] = [];
  addresses: Address[] = [];
  currentStudent: Student | null = null;
  selectedAddressId: number | null = null;
  loading = false;
  error: string | null = null;
  success: string | null = null;
  activeTab: 'cart' | 'history' = 'cart';
  orderHistory: Order[] = [];
  showAddAddressForm = false;
  newAddress: Address = {
    id: 0,
    studentId: 0,
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    type: 'HOME'
  };

  constructor(
    private orderService: OrderService,
    private addressService: AddressService,
    private studentService: StudentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.studentService.getCurrentStudent().subscribe(student => {
      this.currentStudent = student;
      if (!student) {
        this.router.navigate(['/login']);
      } else {
        this.loadCart();
        this.loadAddresses();
        this.loadOrderHistory();
      }
    });
  }

  loadCart(): void {
    this.orderService.getCart().subscribe(cart => {
      this.cart = cart;
    });
  }

  loadAddresses(): void {
    if (!this.currentStudent) return;

    this.addressService.getStudentAddresses(this.currentStudent.id).subscribe({
      next: (data) => {
        this.addresses = data;
        if (data.length > 0) {
          this.selectedAddressId = data[0].id;
        }
      },
      error: (err) => {
        console.error('Error loading addresses:', err);
      }
    });
  }

  loadOrderHistory(): void {
    if (!this.currentStudent) return;

    this.orderService.getOrdersByStudent(this.currentStudent.id).subscribe({
      next: (data) => {
        this.orderHistory = data;
      },
      error: (err) => {
        console.error('Error loading order history:', err);
      }
    });
  }

  removeFromCart(product: Product): void {
    this.orderService.removeFromCart(product.id);
    this.loadCart();
  }

  updateQuantity(product: Product, quantity: number): void {
    if (quantity < 1) {
      this.removeFromCart(product);
    } else {
      // Update cart logic if needed
      this.loadCart();
    }
  }

  getTotalPrice(): number {
    return this.cart.reduce((total, product) => {
      const cartItem = this.cart.find(p => p.id === product.id);
      return total + (product.price * (cartItem ? 1 : 0));
    }, 0);
  }

  getCartTotal(): number {
    return this.cart.reduce((total, product) => total + product.price, 0);
  }

  submitOrder(): void {
    if (!this.currentStudent || !this.selectedAddressId || this.cart.length === 0) {
      this.error = 'Please select an address and ensure cart is not empty';
      return;
    }

    this.loading = true;
    this.error = null;
    this.success = null;

    const orderItems: OrderItem[] = this.cart.map(product => ({
      productId: product.id,
      quantity: 1,
      price: product.price
    }));

    this.orderService.submitOrderWithAddress(
      this.currentStudent.id,
      orderItems,
      this.selectedAddressId
    ).subscribe({
      next: (response) => {
        this.success = 'Order placed successfully! 🎉';
        this.orderService.clearCart();
        this.cart = [];
        this.loadOrderHistory();
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error submitting order:', err);
        this.error = 'Failed to place order. Please try again.';
        this.loading = false;
      }
    });
  }

  addAddress(): void {
    if (!this.currentStudent) return;

    if (!this.newAddress.street || !this.newAddress.city || !this.newAddress.state || !this.newAddress.zipCode) {
      this.error = 'Please fill all fields';
      return;
    }

    this.newAddress.studentId = this.currentStudent.id;
    this.loading = true;

    this.addressService.createAddress(this.newAddress).subscribe({
      next: (response) => {
        this.addresses.push(response);
        this.selectedAddressId = response.id;
        this.showAddAddressForm = false;
        this.newAddress = {
          id: 0,
          studentId: 0,
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
          type: 'HOME'
        };
        this.loading = false;
        this.success = 'Address added successfully!';
      },
      error: (err) => {
        console.error('Error adding address:', err);
        this.error = 'Failed to add address';
        this.loading = false;
      }
    });
  }

  deleteAddress(addressId: number): void {
    if (confirm('Are you sure you want to delete this address?')) {
      this.addressService.deleteAddress(addressId).subscribe({
        next: () => {
          this.addresses = this.addresses.filter(a => a.id !== addressId);
          if (this.selectedAddressId === addressId) {
            this.selectedAddressId = this.addresses.length > 0 ? this.addresses[0].id : null;
          }
          this.success = 'Address deleted successfully!';
        },
        error: (err) => {
          console.error('Error deleting address:', err);
          this.error = 'Failed to delete address';
        }
      });
    }
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  goToShop(): void {
    this.router.navigate(['/products']);
  }
}
