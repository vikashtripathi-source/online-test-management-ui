import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8089/api';

  constructor(protected http: HttpClient) {}

  protected getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  protected get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, {
      headers: this.getHeaders()
    });
  }

  protected post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body, {
      headers: this.getHeaders()
    });
  }

  protected put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, body, {
      headers: this.getHeaders()
    });
  }

  protected delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`, {
      headers: this.getHeaders()
    });
  }

  protected getBaseUrl(): string {
    return this.baseUrl;
  }

  protected postWithCustomHeaders<T>(endpoint: string, body: any, headers: HttpHeaders): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body, {
      headers: headers.append('Authorization', localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '')
    });
  }

  protected getWithCustomHeaders<T>(endpoint: string, headers: HttpHeaders): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, {
      headers: headers.append('Authorization', localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '')
    });
  }
}
