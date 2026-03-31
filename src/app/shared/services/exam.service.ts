import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { 
  Question, 
  SubmitTestRequest, 
  TestResultResponse,
  StudentTestRecord 
} from '../../core/models/exam.model';
import { ApiService } from './api.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ExamService extends ApiService {
  constructor(http: HttpClient) {
    super(http);
  }

  // Questions Management
  addQuestion(question: Question): Observable<Question> {
    return this.post<Question>('/exams/questions', question);
  }

  addMultipleQuestions(questions: Question[]): Observable<Question[]> {
    return this.post<Question[]>('/exams/questions/bulk', questions);
  }

  getAllQuestions(): Observable<Question[]> {
    return this.get<Question[]>('/exams/questions');
  }

  deleteQuestion(id: number): Observable<void> {
    return this.delete<void>(`/exams/questions/${id}`);
  }

  getQuestionsByBranch(branch: string): Observable<Question[]> {
    return this.get<Question[]>(`/exams/questions/branch/${branch}`);
  }

  // Test Submission
  submitTest(request: SubmitTestRequest): Observable<TestResultResponse> {
    return this.post<TestResultResponse>('/exams/tests/submit', request);
  }

  submitTestAsync(request: SubmitTestRequest): Observable<string> {
    return this.post<string>('/exams/tests/async-submit', request);
  }

  // Student Records
  saveStudentTestRecord(record: StudentTestRecord): Observable<StudentTestRecord> {
    return this.post<StudentTestRecord>('/exams/student-records', record);
  }

  getRecordsByBranch(branch: string): Observable<StudentTestRecord[]> {
    return this.get<StudentTestRecord[]>(`/exams/student-records/branch/${branch}`);
  }

  getStudentResults(studentId: number): Observable<TestResultResponse> {
    return this.get<TestResultResponse>(`/exams/results/${studentId}`);
  }

  getStudentTestRecords(): Observable<StudentTestRecord[]> {
    return this.get<StudentTestRecord[]>('/exams/student-records');
  }
}
