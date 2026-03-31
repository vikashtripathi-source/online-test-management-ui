import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { StudentService } from '../../shared/services/student.service';
import { Student } from '../../core/models/student.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="flex h-screen bg-gray-100">
      <!-- Sidebar -->
      <aside class="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-2xl">
        <div class="p-6 border-b border-gray-700">
          <h2 class="text-2xl font-bold text-center"></h2>
          <p class="text-center text-gray-400 text-sm mt-2">Management System</p>
        </div>
        
        <nav class="mt-8 px-4">
          <div *ngFor="let item of menuItems" class="mb-3">
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
      
      <!-- Main Content -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Header -->
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
              <div class="text-right" *ngIf="currentUser">
                <p class="text-sm text-gray-600">{{ currentUser.role || 'Administrator' }}</p>
                <p class="text-sm font-semibold text-gray-800">{{ currentUser.firstName }} {{ currentUser.lastName }}</p>
              </div>
              <button (click)="logout()" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition">
                Logout
              </button>
            </div>
          </div>
        </header>
        
        <!-- Page Content -->
        <main class="flex-1 overflow-auto p-8">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep .router-link-active {
      background-color: #2563eb !important;
    }
  `]
})
export class AdminComponent implements OnInit {
  currentUser: Student | null = null;
  menuItems = [
    { icon: '📊', label: 'Dashboard', path: '/admin/dashboard', color: 'bg-blue-600' },
    { icon: '❓', label: 'Questions', path: '/admin/questions', color: 'bg-purple-600' },
    { icon: '📦', label: 'Products', path: '/admin/products', color: 'bg-green-600' },
    { icon: '📋', label: 'Orders', path: '/admin/orders', color: 'bg-yellow-600' },
    { icon: '📝', label: 'Exams', path: '/admin/exams', color: 'bg-pink-600' }
  ];

  constructor(private router: Router, private studentService: StudentService) {}

  ngOnInit() {
    // Get current user
    this.studentService.getCurrentStudent().subscribe(student => {
      this.currentUser = student;
      console.log('[AdminComponent] Current user:', student);
    });
  }

  isActive(path: string): boolean {
    return this.router.url.includes(path);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('student');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
