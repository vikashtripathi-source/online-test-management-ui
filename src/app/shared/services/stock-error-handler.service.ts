import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';

export interface StockError {
  type: 'INSUFFICIENT_STOCK' | 'PRODUCT_NOT_ACTIVE' | 'PRODUCT_NOT_FOUND' | 'INVALID_QUANTITY';
  message: string;
  productId?: number;
  availableStock?: number;
  requestedStock?: number;
}

@Injectable({
  providedIn: 'root'
})
export class StockErrorHandlerService {

  constructor() { }

  /**
   * Handle HTTP errors related to stock operations
   */
  handleStockError(error: any): Observable<never> {
    console.error('Stock error handler received error:', error);
    
    const stockError: StockError = this.parseStockError(error);
    
    // Return user-friendly error message
    return throwError(() => new Error(stockError.message));
  }

  /**
   * Parse HTTP error and extract stock-related information
   */
  parseStockError(error: any): StockError {
    const errorMessage = error.error?.message || error.message || 'Unknown error occurred';
    const status = error.status;
    
    // Handle insufficient stock errors
    if (errorMessage.includes('insufficient stock') || errorMessage.includes('not enough stock')) {
      const stockMatch = errorMessage.match(/available:\s*(\d+)/i);
      const requestedMatch = errorMessage.match(/requested:\s*(\d+)/i);
      
      return {
        type: 'INSUFFICIENT_STOCK',
        message: this.formatInsufficientStockMessage(
          stockMatch ? parseInt(stockMatch[1]) : 0,
          requestedMatch ? parseInt(requestedMatch[1]) : 0
        ),
        availableStock: stockMatch ? parseInt(stockMatch[1]) : 0,
        requestedStock: requestedMatch ? parseInt(requestedMatch[1]) : 0
      };
    }
    
    // Handle inactive product errors
    if (errorMessage.includes('not active') || errorMessage.includes('not available')) {
      return {
        type: 'PRODUCT_NOT_ACTIVE',
        message: 'This product is currently not available for purchase'
      };
    }
    
    // Handle product not found errors
    if (status === 404 || errorMessage.includes('not found')) {
      return {
        type: 'PRODUCT_NOT_FOUND',
        message: 'Product not found'
      };
    }
    
    // Handle invalid quantity errors
    if (errorMessage.includes('invalid quantity') || errorMessage.includes('quantity must be')) {
      return {
        type: 'INVALID_QUANTITY',
        message: 'Invalid quantity specified'
      };
    }
    
    // Default error
    return {
      type: 'INSUFFICIENT_STOCK',
      message: 'Stock operation failed. Please try again.'
    };
  }

  /**
   * Format user-friendly insufficient stock message
   */
  private formatInsufficientStockMessage(available: number, requested: number): string {
    if (available === 0) {
      return 'This product is currently out of stock';
    } else if (available < requested) {
      return `Only ${available} item(s) available in stock. You requested ${requested}.`;
    } else {
      return 'Insufficient stock available for this product';
    }
  }

  /**
   * Validate stock before operation
   */
  validateStockOperation(currentStock: number, requestedQuantity: number, operation: 'add' | 'update' | 'remove'): StockError | null {
    if (operation === 'add' || operation === 'update') {
      if (currentStock < requestedQuantity) {
        return {
          type: 'INSUFFICIENT_STOCK',
          message: this.formatInsufficientStockMessage(currentStock, requestedQuantity),
          availableStock: currentStock,
          requestedStock: requestedQuantity
        };
      }
    }
    
    if (requestedQuantity <= 0) {
      return {
        type: 'INVALID_QUANTITY',
        message: 'Quantity must be greater than 0'
      };
    }
    
    return null;
  }

  /**
   * Get user-friendly action suggestions based on error type
   */
  getSuggestionForError(error: StockError): string {
    switch (error.type) {
      case 'INSUFFICIENT_STOCK':
        if (error.availableStock === 0) {
          return 'Please check back later when this product is restocked.';
        } else {
          return `You can add up to ${error.availableStock} item(s) to your cart.`;
        }
      case 'PRODUCT_NOT_ACTIVE':
        return 'This product has been temporarily disabled. Please contact support for more information.';
      case 'PRODUCT_NOT_FOUND':
        return 'The product you are looking for does not exist. Please refresh the page and try again.';
      case 'INVALID_QUANTITY':
        return 'Please enter a valid quantity greater than 0.';
      default:
        return 'Please try again or contact support if the problem persists.';
    }
  }

  /**
   * Create a comprehensive error response for UI display
   */
  createErrorResponse(error: StockError): {
    title: string;
    message: string;
    suggestion: string;
    type: 'error' | 'warning' | 'info';
  } {
    const suggestion = this.getSuggestionForError(error);
    
    return {
      title: this.getErrorTitle(error.type),
      message: error.message,
      suggestion,
      type: error.type === 'PRODUCT_NOT_ACTIVE' ? 'warning' : 'error'
    };
  }

  private getErrorTitle(type: StockError['type']): string {
    switch (type) {
      case 'INSUFFICIENT_STOCK':
        return 'Insufficient Stock';
      case 'PRODUCT_NOT_ACTIVE':
        return 'Product Unavailable';
      case 'PRODUCT_NOT_FOUND':
        return 'Product Not Found';
      case 'INVALID_QUANTITY':
        return 'Invalid Quantity';
      default:
        return 'Error';
    }
  }
}
