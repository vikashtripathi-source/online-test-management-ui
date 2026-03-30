import { Injectable } from '@angular/core';
import { ApiService } from './api';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private api: ApiService) {}

  login(data: any) {
    return this.api.post('/students/login', data);
  }

  register(data: any) {
    return this.api.post('/students/register', data);
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
  saveUser(data: any) {
  localStorage.setItem('user', JSON.stringify(data));
}
}