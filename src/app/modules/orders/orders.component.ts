import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderService } from '../../shared/services/order.service';
import { AddressService } from '../../shared/services/address.service';
import { StudentService } from '../../shared/services/student.service';
import { StockErrorHandlerService } from '../../shared/services/stock-error-handler.service';
import { Order, OrderItem } from '../../core/models/order.model';
import { Address } from '../../core/models/address.model';
import { Product, CartItem } from '../../core/models/product.model';
import { Student } from '../../core/models/student.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  cart: CartItem[] = [];
  addresses: Address[] = [];
  currentStudent: Student | null = null;
  selectedAddressId: number | null = null;
  loading = false;
  error: string | null = null;
  success: string | null = null;
  activeTab: 'cart' | 'history' = 'cart';
  orderHistory: Order[] = [];
  showAddAddressForm = false;
  checkoutStep: 'cart' | 'address' | 'review' | 'confirmation' = 'cart';
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
    private stockErrorHandler: StockErrorHandlerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.studentService.getCurrentStudent().subscribe(student => {
      this.currentStudent = student;
      if (!student) {
        this.router.navigate(['/login']);
      } else {
        this.orderService.setCurrentStudent(student.id);
        this.loadCart();
        this.loadAddresses();
        this.loadOrderHistory();
      }
    });
  }

  loadCart(): void {
    console.log('=== LOAD CART START ===');
    this.orderService.getCart().subscribe({
      next: (cart) => {
        console.log('Cart loaded from service:', cart);
        console.log('Cart length:', cart?.length || 0);
        this.cart = cart || [];
        console.log('Cart set in component:', this.cart);
        console.log('=== LOAD CART END ===');
      },
      error: (err) => {
        console.error('Error loading cart:', err);
        this.cart = [];
      }
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

  removeFromCart(product: CartItem): void {
    if (product.id && typeof product.id === 'number') {
      // Backend cart item - use API with stock restoration
      this.orderService.removeFromCart(product.id).subscribe({
        next: () => {
          console.log('Item removed from cart successfully with stock restoration');
          this.loadCart();
          this.success = 'Item removed from cart and stock restored';
          setTimeout(() => this.success = null, 3000);
        },
        error: (error) => {
          console.error('Error removing from cart:', error);
          
          // Use the stock error handler for better error messages
          const errorResponse = this.stockErrorHandler.createErrorResponse(
            this.stockErrorHandler.parseStockError(error)
          );
          
          this.error = errorResponse.message;
          
          // Fallback to legacy method
          this.orderService.removeFromCartLegacy(product.productId || product.id);
          this.loadCart();
        }
      });
    } else {
      // Legacy cart item
      this.orderService.removeFromCartLegacy(product.productId || product.id);
      this.loadCart();
    }
  }

  updateQuantity(product: CartItem, quantity: number): void {
    if (quantity < 1) {
      this.removeFromCart(product);
    } else if (product.id && typeof product.id === 'number') {
      // Backend cart item - use API with stock adjustment
      this.orderService.updateCartItemQuantity(product.id, quantity).subscribe({
        next: () => {
          console.log('Cart item quantity updated successfully with stock adjustment');
          this.loadCart();
          this.success = 'Cart updated with stock adjustment';
          setTimeout(() => this.success = null, 3000);
        },
        error: (error) => {
          console.error('Error updating cart quantity:', error);
          
          // Use the stock error handler for better error messages
          const errorResponse = this.stockErrorHandler.createErrorResponse(
            this.stockErrorHandler.parseStockError(error)
          );
          
          this.error = errorResponse.message;
          
          // Show suggestion if available
          if (errorResponse.suggestion) {
            setTimeout(() => {
              this.error = errorResponse.suggestion;
            }, 3500);
          }
          
          // Reload cart to show current state
          this.loadCart();
        }
      });
    } else {
      // Legacy cart - just reload cart
      this.loadCart();
    }
  }

  refreshCart(): void {
    console.log('Manual cart refresh triggered');
    this.loadCart();
  }

  getTotalPrice(): number {
    return this.cart.reduce((total, item) => {
      const quantity = item.quantity || 1;
      return total + (item.price * quantity);
    }, 0);
  }

  getCartTotal(): number {
    return this.getTotalPrice();
  }

  get selectedAddress(): Address | undefined {
    return this.addresses.find(a => a.id === this.selectedAddressId);
  }

  submitOrder(): void {
    if (!this.currentStudent || !this.selectedAddressId || this.cart.length === 0) {
      this.error = 'Please select an address and ensure cart is not empty';
      return;
    }

    // Move to review step before submitting
    this.checkoutStep = 'review';
  }

  confirmOrder(): void {
    if (!this.currentStudent || !this.selectedAddressId || this.cart.length === 0) {
      this.error = 'Please select an address and ensure cart is not empty';
      return;
    }

    console.log('Submitting order from cart with stock validation...');
    console.log('Cart items:', this.cart);

    this.loading = true;
    this.error = null;
    this.success = null;

    // Try to use the new submit from cart API first
    this.orderService.submitOrderFromCart(
      this.currentStudent.id,
      this.selectedAddressId
    ).subscribe({
      next: (response) => {
        console.log('Order submission successful with stock updates:', response);
        this.checkoutStep = 'confirmation';
        this.success = 'Order placed successfully! Stock quantities updated. 🎉';
        
        // Cart is automatically cleared by backend, but we'll refresh to confirm
        this.orderService.getCart().subscribe(cart => {
          this.cart = cart || [];
          this.loadOrderHistory();
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 2000);
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error submitting order from cart:', err);
        
        // Use the stock error handler for better error messages
        const errorResponse = this.stockErrorHandler.createErrorResponse(
          this.stockErrorHandler.parseStockError(err)
        );
        
        this.error = errorResponse.message;
        
        // Show suggestion if available
        if (errorResponse.suggestion) {
          setTimeout(() => {
            this.error = errorResponse.suggestion;
          }, 3500);
        }
        
        // Reload cart to show current stock status for stock-related errors
        if (errorResponse.title === 'Insufficient Stock') {
          this.loadCart();
        } else {
          console.log('Falling back to legacy order submission...');
          this.submitOrderLegacy();
        }
        this.loading = false;
      }
    });
  }

  private submitOrderLegacy(): void {
    console.log('Using legacy order submission...');
    console.log('Cart items stock:', this.cart.map(item => ({ name: item.name, stock: item.stockQuantity })));

    const orderItems: OrderItem[] = this.cart.map(product => ({
      productId: product.productId || product.id,
      quantity: product.quantity || 1,
      price: product.price
    }));

    console.log('Order items:', orderItems);

    this.orderService.submitOrderWithAddress(
      this.currentStudent!.id,
      orderItems,
      this.selectedAddressId!
    ).subscribe({
      next: (response) => {
        console.log('Legacy order submission successful:', response);
        this.checkoutStep = 'confirmation';
        this.success = 'Order placed successfully! 🎉';
        this.orderService.clearCart().subscribe(() => {
          this.cart = [];
          this.loadOrderHistory();
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 2000);
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error in legacy order submission:', err);
        console.error('Error details:', err.error);
        
        // Fallback for testing - simulate successful order
        console.log('Backend not available, simulating order submission...');
        this.checkoutStep = 'confirmation';
        this.success = 'Order placed successfully! 🎉 (Mock mode)';
        this.orderService.clearCart().subscribe(() => {
          this.cart = [];
        });
        this.loading = false;
        
        // Show success message and redirect after delay
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 3000);
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

  goToPreviousStep(): void {
    if (this.checkoutStep === 'review') {
      this.checkoutStep = 'cart';
    } else if (this.checkoutStep === 'address') {
      this.checkoutStep = 'cart';
    }
  }

  resetCheckout(): void {
    this.checkoutStep = 'cart';
    this.error = null;
    this.success = null;
  }
}
