import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Address } from '../../core/models/address.model';
import { ApiService } from './api.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AddressService extends ApiService {
  constructor(http: HttpClient) {
    super(http);
  }

  getAllAddresses(): Observable<Address[]> {
    return this.get<Address[]>('/addresses');
  }

  getAddressById(id: number): Observable<Address> {
    return this.get<Address>(`/addresses/${id}`);
  }

  createAddress(address: Address): Observable<Address> {
    return this.post<Address>('/addresses', address);
  }

  updateAddress(id: number, address: Address): Observable<Address> {
    return this.put<Address>(`/addresses/${id}`, address);
  }

  deleteAddress(id: number): Observable<void> {
    return this.delete<void>(`/addresses/${id}`);
  }

  getAddressesByType(type: 'HOME' | 'COLLEGE'): Observable<Address[]> {
    return this.get<Address[]>(`/addresses/type/${type}`);
  }

  getStudentAddresses(studentId: number): Observable<Address[]> {
    return this.get<Address[]>(`/orders/student/${studentId}/addresses`);
  }
}
