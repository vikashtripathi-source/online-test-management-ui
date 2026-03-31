import { Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { QuestionManagerComponent } from './components/question-manager/question-manager.component';
import { ProductAdminComponent } from './components/product-admin/product-admin.component';
import { OrderManagementComponent } from './components/order-management/order-management.component';
import { ExamAdminComponent } from './components/exam-admin/exam-admin.component';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'questions', component: QuestionManagerComponent },
      { path: 'products', component: ProductAdminComponent },
      { path: 'orders', component: OrderManagementComponent },
      { path: 'exams', component: ExamAdminComponent }
    ]
  }
];
