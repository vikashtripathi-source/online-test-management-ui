import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

interface MenuItem {
  icon: string;
  label: string;
  path: string;
  color: string;
}

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-2xl">
      <div class="p-6 border-b border-gray-700">
        <h2 class="text-2xl font-bold text-center"></h2>
        <p class="text-center text-gray-400 text-sm mt-2">Management System</p>
      </div>
      
      <nav class="mt-8 px-4">
        <div *ngFor="let item of menuItems; let i = index" class="mb-3">
          <a 
            [routerLink]="item.path"
            routerLinkActive="active"
            class="flex items-center gap-4 px-4 py-3 rounded-lg transition duration-200"
            [ngClass]="{
              'bg-blue-600 text-white': isActive(item.path),
              'text-gray-300 hover:bg-gray-700': !isActive(item.path)
            }">
            <span class="text-2xl">{{ item.icon }}</span>
            <span class="font-semibold">{{ item.label }}</span>
          </a>
        </div>
      </nav>

      <div class="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-700 bg-gray-800">
        <p class="text-xs text-gray-500 text-center">© 2026 Admin Panel</p>
        <p class="text-xs text-gray-500 text-center mt-2">Version 1.0</p>
      </div>
    </aside>
  `,
  styles: [`
    :host ::ng-deep .router-link-active {
      background-color: #2563eb !important;
    }
  `]
})
export class AdminSidebarComponent {
  menuItems: MenuItem[] = [
    { icon: '📊', label: 'Dashboard', path: '/admin/dashboard', color: 'bg-blue-600' },
    { icon: '❓', label: 'Questions', path: '/admin/questions', color: 'bg-purple-600' },
    { icon: '📦', label: 'Products', path: '/admin/products', color: 'bg-green-600' },
    { icon: '📋', label: 'Orders', path: '/admin/orders', color: 'bg-yellow-600' },
    { icon: '📝', label: 'Exams', path: '/admin/exams', color: 'bg-pink-600' }
  ];

  constructor(private router: Router) {}

  isActive(path: string): boolean {
    return this.router.url.includes(path);
  }
}
