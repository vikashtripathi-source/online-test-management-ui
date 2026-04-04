import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../../shared/services/student.service';
import { Router } from '@angular/router';
import { StudentDTO } from '../../../core/models/student.model';

@Component({
  selector: 'app-admin-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-register.html',
  styleUrls: ['./admin-register.css']
})
export class AdminRegisterComponent {
  form: StudentDTO = {
    id: 0,
    email: '',
    firstName: '',
    lastName: '',
    branch: 'CSE', // Default to CSE instead of empty string
    mobileNumber: '',
    imageUrl: '',
    password: '',
    role: 'TEACHER'  // Default role for admin registration
  };
  
  adminCode = '';
  loading = false;
  error: string | null = null;
  success: string | null = null;
  branches = ['CSE', 'EC', 'IT', 'MECHANICAL']; // Match backend enum exactly
  roles: Array<{label: string, value: 'TEACHER' | 'ADMIN' | 'MANAGER'}> = [
    { label: 'Teacher', value: 'TEACHER' },
    { label: 'Admin', value: 'ADMIN' },
    { label: 'Manager', value: 'MANAGER' }
  ];

  constructor(private studentService: StudentService, private router: Router) {}

  register() {
    // Validation
    if (!this.form.email || !this.form.password || !this.form.firstName || 
        !this.form.lastName || !this.form.branch || !this.form.mobileNumber) {
      this.error = 'Please fill all required fields';
      return;
    }

    if (!this.adminCode || this.adminCode.trim() === '') {
      this.error = 'Admin Code is required. Please contact administration for the code.';
      return;
    }

    if (this.form.password.length < 6) {
      this.error = 'Password must be at least 6 characters';
      return;
    }

    if (!/^\d{10}$/.test(this.form.mobileNumber)) {
      this.error = 'Mobile number must be 10 digits';
      return;
    }

    if (!this.form.role) {
      this.error = 'Please select a role';
      return;
    }

    this.loading = true;
    this.error = null;
    this.success = null;

    // Create payload with admin code for backend validation
    const payload = {
      ...this.form,
      adminCode: this.adminCode.trim()
    };

    console.log('[AdminRegisterComponent] Registering admin user:', {
      email: this.form.email,
      role: this.form.role,
      firstName: this.form.firstName,
      lastName: this.form.lastName,
      branch: this.form.branch,
      adminCode: this.adminCode // Log the code being sent
    });

    console.log('[AdminRegisterComponent] Full payload:', payload);

    this.studentService.registerAdmin(payload).subscribe({
      next: (response) => {
        this.loading = false;
        this.success = `✓ Registration successful as ${this.form.role}! Redirecting to login...`;
        console.log('Admin registration successful:', response);
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.loading = false;
        console.error('Admin registration error:', err);
        
        if (err.status === 400) {
          this.error = err.error?.message || 'Invalid admin code or registration data. Please try again.';
        } else if (err.status === 409) {
          this.error = 'Email already registered. Please use a different email.';
        } else if (err.status === 0) {
          this.error = 'Cannot connect to server. Make sure backend is running.';
        } else {
          this.error = err.error?.message || 'Registration failed. Please try again.';
        }
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
