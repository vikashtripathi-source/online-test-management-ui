import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ExamService } from '../../shared/services/exam.service';
import { StudentService } from '../../shared/services/student.service';
import { Question, SubmitTestRequest, TestResultResponse } from '../../core/models/exam.model';
import { Student } from '../../core/models/student.model';

@Component({
  selector: 'app-exams',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './exams.component.html',
  styleUrls: ['./exams.component.css']
})
export class ExamsComponent implements OnInit {
  questions: Question[] = [];
  currentStudent: Student | null = null;
  testStarted = false;
  testCompleted = false;
  currentQuestionIndex = 0;
  answers: Map<number, string> = new Map();
  testResult: TestResultResponse | null = null;
  loading = true;
  error: string | null = null;
  testDuration = 0;
  timeRemaining = 0;
  timerInterval: any;

  constructor(
    private examService: ExamService,
    private studentService: StudentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.studentService.getCurrentStudent().subscribe(student => {
      this.currentStudent = student;
    });
    
    this.loadQuestions();
  }

  loadQuestions(): void {
    this.examService.getAllQuestions().subscribe({
      next: (data) => {
        this.questions = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading questions:', err);
        this.error = 'Failed to load questions';
        this.loading = false;
      }
    });
  }

  startTest(): void {
    this.testStarted = true;
    this.testDuration = this.questions.length * 2 * 60; // 2 minutes per question
    this.timeRemaining = this.testDuration;
    this.startTimer();
  }

  startTimer(): void {
    this.timerInterval = setInterval(() => {
      this.timeRemaining--;
      if (this.timeRemaining <= 0) {
        this.submitTest();
      }
    }, 1000);
  }

  getCurrentQuestion(): Question | null {
    return this.questions[this.currentQuestionIndex] || null;
  }

  selectAnswer(answer: string): void {
    const question = this.getCurrentQuestion();
    if (question) {
      this.answers.set(question.id, answer);
    }
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  submitTest(): void {
    if (!this.currentStudent) return;

    clearInterval(this.timerInterval);

    const answersArray = Array.from(this.answers.entries()).map(([questionId, answer]) => ({
      questionId,
      selectedAnswer: answer
    }));

    const request: SubmitTestRequest = {
      studentId: this.currentStudent.id,
      answers: answersArray,
      testTime: this.testDuration - this.timeRemaining
    };

    this.examService.submitTest(request).subscribe({
      next: (result) => {
        this.testResult = result;
        this.testCompleted = true;
        this.testStarted = false;
      },
      error: (err) => {
        console.error('Error submitting test:', err);
        this.error = 'Failed to submit test';
      }
    });
  }

  cancelTest(): void {
    if (confirm('Are you sure you want to cancel this test? Your progress will be lost.')) {
      clearInterval(this.timerInterval);
      this.testStarted = false;
      this.testCompleted = false;
      this.currentQuestionIndex = 0;
      this.answers.clear();
    }
  }

  retakTest(): void {
    this.testStarted = false;
    this.testCompleted = false;
    this.currentQuestionIndex = 0;
    this.answers.clear();
    this.testResult = null;
  }

  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
