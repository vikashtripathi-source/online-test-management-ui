import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../../shared/services/student.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {

  form = {
    email: '',
    password: ''
  };
  loading = false;
  error: string | null = null;
  showPassword = false;

  constructor(private studentService: StudentService, private router: Router) {}

  login() {
    if (!this.form.email || !this.form.password) {
      this.error = 'Please enter email and password';
      return;
    }

    this.loading = true;
    this.error = null;
    console.log('Attempting login with:', this.form.email);

    this.studentService.login(this.form).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        this.loading = false;
        
        // Get user role and route accordingly
        const userRole = response.student?.role || 'STUDENT';
        console.log('[LoginComponent] User role:', userRole);
        
        if (userRole === 'ADMIN' || userRole === 'TEACHER' || userRole === 'MANAGER') {
          console.log('Routing to admin dashboard...');
          this.router.navigate(['/admin/dashboard']);
        } else {
          console.log('Routing to student dashboard...');
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Login error:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);
        console.error('Error response:', err.error);
        
        if (err.status === 401) {
          this.error = 'Invalid email or password';
        } else if (err.status === 0) {
          this.error = 'Cannot connect to server. Make sure backend is running on port 8089';
        } else {
          this.error = err.error?.message || 'Login failed. Please try again.';
        }
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  goToAdminRegister() {
    this.router.navigate(['/admin-register']);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}