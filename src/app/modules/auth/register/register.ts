import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../../shared/services/student.service';
import { Router } from '@angular/router';
import { StudentDTO } from '../../../core/models/student.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  form: StudentDTO = {
    id: 0,
    email: '',
    firstName: '',
    lastName: '',
    branch: '',
    mobileNumber: '',
    imageUrl: '',
    password: ''
  };
  
  loading = false;
  error: string | null = null;
  success: string | null = null;
  branches = ['CSE', 'ECE', 'Mechanical', 'Civil', 'Electrical'];

  constructor(private studentService: StudentService, private router: Router) {}

  register() {
    // Validation
    if (!this.form.email || !this.form.password || !this.form.firstName || 
        !this.form.lastName || !this.form.branch || !this.form.mobileNumber) {
      this.error = 'Please fill all required fields';
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

    this.loading = true;
    this.error = null;
    this.success = null;

    this.studentService.register(this.form).subscribe({
      next: (response) => {
        this.loading = false;
        this.success = 'Registration successful! Redirecting to login...';
        console.log('Registration successful:', response);
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.loading = false;
        console.error('Registration error:', err);
        this.error = err.error?.message || 'Registration failed. Please try again.';
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
