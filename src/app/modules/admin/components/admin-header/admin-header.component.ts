import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="bg-white shadow-md border-b-4 border-blue-600">
      <div class="flex items-center justify-between px-8 py-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
            <span class="text-white text-xl font-bold">⚙️</span>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-800">Admin Panel</h1>
            <p class="text-sm text-gray-600">Manage your platform</p>
          </div>
        </div>
        
        <div class="flex items-center gap-6">
          <div class="text-right">
            <p class="text-sm text-gray-600">Administrator</p>
            <p class="text-sm font-semibold text-gray-800">Admin User</p>
          </div>
          <button (click)="logout()" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition">
            Logout
          </button>
        </div>
      </div>
    </header>
  `,
  styles: []
})
export class AdminHeaderComponent {
  constructor(private router: Router) {}

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('student');
    this.router.navigate(['/login']);
  }
}
