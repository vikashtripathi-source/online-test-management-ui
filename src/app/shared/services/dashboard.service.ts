import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Dashboard } from '../../core/models/dashboard.model';
import { ApiService } from './api.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DashboardService extends ApiService {
  constructor(http: HttpClient) {
    super(http);
  }

  getDashboard(studentId: number): Observable<Dashboard> {
    return this.get<Dashboard>(`/dashboard/${studentId}`);
  }
}
