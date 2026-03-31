import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { Router } from '@angular/router';
import { StudentService } from '../../shared/services/student.service';
import { Student, UserRole } from '../../core/models/student.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class HeaderComponent implements OnInit {
  isAdmin = false;
  currentUser: Student | null = null;

  constructor(
    private auth: AuthService,
    private router: Router,
    private studentService: StudentService
  ) {}

  ngOnInit() {
    // Check if current user is admin
    this.studentService.getCurrentStudent().subscribe(student => {
      this.currentUser = student;
      this.isAdmin = this.checkIsAdmin(student?.role);
      console.log('[HeaderComponent] User role:', student?.role, 'Is Admin:', this.isAdmin);
    });
  }

  checkIsAdmin(role?: UserRole): boolean {
    return role === 'ADMIN' || role === 'TEACHER' || role === 'MANAGER';
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}