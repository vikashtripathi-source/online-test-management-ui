import { Routes } from '@angular/router';
import { LoginComponent } from './modules/auth/login/login';
import { RegisterComponent } from './modules/auth/register/register';
import { AdminRegisterComponent } from './modules/auth/admin-register/admin-register';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { ExamsComponent } from './modules/exams/exams.component';
import { ProductsComponent } from './modules/products/products.component';
import { OrdersComponent } from './modules/orders/orders.component';
import { adminRoutes } from './modules/admin/admin.routes';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'admin-register', component: AdminRegisterComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'exams', component: ExamsComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'orders', component: OrdersComponent },
  { path: 'admin', children: adminRoutes },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];