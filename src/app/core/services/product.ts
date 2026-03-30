import { Injectable } from '@angular/core';
import { ApiService } from './api';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private api: ApiService) {}

  getAll() {
    return this.api.get('/products');
  }

  add(product: any) {
    return this.api.post('/products', product);
  }

  delete(id: number) {
    return this.api.delete('/products/' + id);
  }
}