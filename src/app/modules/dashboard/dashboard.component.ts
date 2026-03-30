import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DashboardService } from '../../shared/services/dashboard.service';
import { StudentService } from '../../shared/services/student.service';
import { Dashboard } from '../../core/models/dashboard.model';
import { Student } from '../../core/models/student.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  dashboard: Dashboard | null = null;
  currentStudent: Student | null = null;
  loading = true;
  error: string | null = null;
  private subscriptions: Subscription[] = [];

  constructor(
    private dashboardService: DashboardService,
    private studentService: StudentService,
    private router: Router
  ) {
    console.log('DashboardComponent initialized');
  }

  ngOnInit(): void {
    console.log('[DashboardComponent] ngOnInit - START');
    console.log('[DashboardComponent] Student present:', localStorage.getItem('student') ? 'Yes' : 'No');
    
    const studentSub = this.studentService.getCurrentStudent().subscribe(student => {
      console.log('[DashboardComponent] getCurrentStudent emitted:', student);
      this.currentStudent = student;
      
      if (student) {
        console.log('[DashboardComponent] Student found, loading dashboard');
        this.loadDashboard(student.id);
      } else {
        console.log('[DashboardComponent] No student found in subscription');
        this.loading = false;
      }
    });
    
    this.subscriptions.push(studentSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadDashboard(studentId: number): void {
    console.log('[DashboardComponent] loadDashboard() - starting for student:', studentId);
    
    const dashboardSub = this.dashboardService.getDashboard(studentId).subscribe({
      next: (data) => {
        console.log('[DashboardComponent] Dashboard data loaded successfully:', data);
        this.dashboard = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('[DashboardComponent] Error loading dashboard:', err);
        console.error('[DashboardComponent] Error status:', err.status);
        console.error('[DashboardComponent] Error message:', err.message);
        this.error = 'Failed to load dashboard data. Status: ' + err.status;
        this.loading = false;
      }
    });
    
    this.subscriptions.push(dashboardSub);
  }

  navigateToExams(): void {
    this.router.navigate(['/exams']);
  }

  navigateToProducts(): void {
    this.router.navigate(['/products']);
  }

  navigateToOrders(): void {
    this.router.navigate(['/orders']);
  }

  logout(): void {
    localStorage.removeItem('student');
    this.router.navigate(['/login']);
  }
}
