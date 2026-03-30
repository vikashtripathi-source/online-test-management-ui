import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Student, LoginRequest, JwtResponse, StudentDTO } from '../../core/models/student.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class StudentService extends ApiService {
  private currentStudent$ = new BehaviorSubject<Student | null>(null);

  constructor(http: HttpClient) {
    super(http);
    console.log('[StudentService] Constructor called');
    this.loadCurrentStudent();
  }

  private loadCurrentStudent() {
    try {
      const student = localStorage.getItem('student');
      console.log('[StudentService] loadCurrentStudent() - student from localStorage:', student);
      if (student && student !== 'undefined' && student.trim()) {
        const parsed = JSON.parse(student);
        this.currentStudent$.next(parsed);
        console.log('[StudentService] Student loaded successfully:', parsed);
      } else {
        console.log('[StudentService] No valid student data in localStorage');
      }
    } catch (error) {
      console.error('[StudentService] Error parsing student from localStorage:', error);
      localStorage.removeItem('student');
      this.currentStudent$.next(null);
    }
  }

  getCurrentStudent(): Observable<Student | null> {
    return this.currentStudent$.asObservable();
  }

  register(student: StudentDTO): Observable<Student> {
    return this.post<Student>('/students/register', student).pipe(
      tap(response => {
        localStorage.setItem('student', JSON.stringify(response));
        this.currentStudent$.next(response);
      })
    );
  }

  login(req: LoginRequest): Observable<JwtResponse> {
    return this.post<JwtResponse>('/students/login', req).pipe(
      tap(response => {
        console.log('[StudentService] Login successful:', response);
        localStorage.setItem('student', JSON.stringify(response.student));
        this.currentStudent$.next(response.student);
      })
    );
  }

  getById(id: number): Observable<Student> {
    return this.get<Student>(`/students/${id}`);
  }

  uploadImage(id: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);

    return this.http.post(`${this.getBaseUrl()}/students/${id}/image`, formData);
  }

  getImage(id: number): Observable<Blob> {
    return this.http.get(
      `${this.getBaseUrl()}/students/${id}/image`,
      { responseType: 'blob' }
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('student');
    this.currentStudent$.next(null);
  }
}
