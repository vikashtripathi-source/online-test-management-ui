import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Report } from '../../core/models/report.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ReportService extends ApiService {
  constructor(http: HttpClient) {
    super(http);
  }

  generateReportData(): Observable<Report[]> {
    return this.get<Report[]>('/reports');
  }

  downloadCsvReport(): Observable<Blob> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : ''
    });

    return this.http.get(`${this.getBaseUrl()}/reports/csv`, {
      headers,
      responseType: 'blob'
    });
  }
}
