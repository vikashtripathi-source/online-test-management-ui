import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExamService } from '../../../../shared/services/exam.service';
import { Question, QuestionRequest } from '../../../../core/models/exam.model';

@Component({
  selector: 'app-question-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div>
      <h1 class="text-3xl font-bold text-gray-800 mb-8">Question Manager</h1>

      <!-- New Question Form -->
      <div class="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span>➕</span> Add New Question
        </h2>

        <form [formGroup]="questionForm" (ngSubmit)="addQuestion()" class="space-y-6">
          <!-- Question Text -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Question *</label>
            <textarea 
              formControlName="questionText"
              rows="3"
              class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              placeholder="Enter the question text..."></textarea>
            <p class="text-red-500 text-sm mt-1" *ngIf="isFieldInvalid('questionText')">
              Question is required
            </p>
          </div>

          <!-- Branch and Difficulty -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Branch *</label>
              <select 
                formControlName="branch"
                class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
                <option value="">Select Branch</option>
                <option value="CSE">CSE</option>
                <option value="EC">EC</option>
                <option value="IT">IT</option>
                <option value="MECHANICAL">MECHANICAL</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Difficulty *</label>
              <select 
                formControlName="difficulty"
                class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
                <option value="">Select Difficulty</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
          </div>

          <!-- Options -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Option A *</label>
              <input 
                type="text"
                formControlName="optionA"
                class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="Option A">
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Option B *</label>
              <input 
                type="text"
                formControlName="optionB"
                class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="Option B">
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Option C *</label>
              <input 
                type="text"
                formControlName="optionC"
                class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="Option C">
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Option D *</label>
              <input 
                type="text"
                formControlName="optionD"
                class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="Option D">
            </div>
          </div>

          <!-- Correct Answer -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Correct Answer *</label>
            <select 
              formControlName="correctAnswer"
              class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
              <option value="">Select Correct Answer</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit"
            [disabled]="!questionForm.valid || loading"
            class="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-bold py-3 rounded-lg transition disabled:opacity-50">
            {{ loading ? '⏳ Adding...' : '➕ Add Question' }}
          </button>

          <!-- Messages -->
          <div *ngIf="successMessage" class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded">
            ✅ {{ successMessage }}
          </div>
          <div *ngIf="errorMessage" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
            ❌ {{ errorMessage }}
          </div>
        </form>
      </div>

      <!-- Questions List -->
      <div class="bg-white rounded-lg shadow-lg p-8">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">📋 All Questions ({{ questions.length }})</h2>

        <div class="space-y-4">
          <div *ngFor="let q of questions; let i = index" class="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-md transition">
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <p class="text-lg font-semibold text-gray-800">{{ i + 1 }}. {{ q.question || q.questionText }}</p>
                <div class="flex gap-3 mt-2">
                  <span class="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">{{ q.branch }}</span>
                  <span [ngClass]="{
                    'bg-green-100 text-green-800': q.difficulty === 'EASY',
                    'bg-yellow-100 text-yellow-800': q.difficulty === 'MEDIUM',
                    'bg-red-100 text-red-800': q.difficulty === 'HARD'
                  }" class="inline-block px-3 py-1 rounded-full text-sm font-semibold">{{ q.difficulty }}</span>
                </div>
              </div>
              <button 
                (click)="deleteQuestion(q.id)"
                class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition">
                🗑️ Delete
              </button>
            </div>
            
            <div class="grid grid-cols-2 gap-4 mt-4 text-sm">
              <div class="bg-gray-50 p-3 rounded">
                <p class="text-gray-600"><strong>A:</strong> {{ q.optionA }}</p>
              </div>
              <div class="bg-gray-50 p-3 rounded">
                <p class="text-gray-600"><strong>B:</strong> {{ q.optionB }}</p>
              </div>
              <div class="bg-gray-50 p-3 rounded">
                <p class="text-gray-600"><strong>C:</strong> {{ q.optionC }}</p>
              </div>
              <div class="bg-gray-50 p-3 rounded">
                <p class="text-gray-600"><strong>D:</strong> {{ q.optionD }}</p>
              </div>
            </div>
            
            <p class="text-sm text-gray-600 mt-3">
              <strong>Correct Answer:</strong> 
              <span class="bg-green-100 text-green-800 px-2 py-1 rounded font-bold">{{ q.correctAnswer }}</span>
            </p>
          </div>

          <div *ngIf="questions.length === 0" class="text-center py-12">
            <p class="text-gray-500 text-lg">No questions added yet. Create one to get started! 🚀</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class QuestionManagerComponent implements OnInit {
  questions: Question[] = [];
  questionForm!: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private examService: ExamService,
    private fb: FormBuilder
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.loadQuestions();
  }

  initForm() {
    this.questionForm = this.fb.group({
      questionText: ['', Validators.required],
      optionA: ['', Validators.required],
      optionB: ['', Validators.required],
      optionC: ['', Validators.required],
      optionD: ['', Validators.required],
      correctAnswer: ['', Validators.required],
      branch: ['', Validators.required],
      difficulty: ['', Validators.required]
    });
  }

  loadQuestions() {
    this.examService.getAllQuestions().subscribe({
      next: (data) => {
        this.questions = data;
      },
      error: () => {
        this.errorMessage = 'Failed to load questions';
      }
    });
  }

  addQuestion() {
    if (this.questionForm.invalid) return;

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    // Map frontend form data to backend API format
    const questionData: QuestionRequest = {
      question: this.questionForm.value.questionText, // Map questionText to question
      optionA: this.questionForm.value.optionA,
      optionB: this.questionForm.value.optionB,
      optionC: this.questionForm.value.optionC,
      optionD: this.questionForm.value.optionD,
      correctAnswer: this.questionForm.value.correctAnswer,
      branch: this.questionForm.value.branch,
      difficulty: this.questionForm.value.difficulty
    };

    this.examService.addQuestion(questionData).subscribe({
      next: (question) => {
        this.questions.push(question);
        this.questionForm.reset();
        this.successMessage = 'Question added successfully! ✅';
        this.loading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('Error adding question:', error);
        this.errorMessage = 'Failed to add question. Please try again.';
        this.loading = false;
      }
    });
  }

  deleteQuestion(id: number) {
    if (confirm('Are you sure you want to delete this question?')) {
      this.examService.deleteQuestion(id).subscribe({
        next: () => {
          this.questions = this.questions.filter(q => q.id !== id);
          this.successMessage = 'Question deleted successfully! ✅';
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: () => {
          this.errorMessage = 'Failed to delete question.';
        }
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.questionForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
