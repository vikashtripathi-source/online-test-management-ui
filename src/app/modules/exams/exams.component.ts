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
        console.log('Raw API response:', data);
        
        // Check if data is empty or invalid, then use mock data
        if (!data || data.length === 0) {
          console.log('No data from API, using mock data');
          this.useMockData();
          return;
        }
        
        // Map API response to frontend model and handle field name differences
        this.questions = data.map(item => ({
          id: item.id,
          questionText: item.questionText || item.question || `Question ${item.id}`, // Handle missing questionText
          optionA: item.optionA || '',
          optionB: item.optionB || '',
          optionC: item.optionC || '',
          optionD: item.optionD || '',
          correctAnswer: item.correctAnswer || '',
          branch: item.branch || 'CSE', // Default to CSE if not specified
          difficulty: item.difficulty || 'MEDIUM'
        }));
        
        console.log('Mapped questions:', this.questions);
        console.log('Question details:', this.questions.map(q => ({ 
          id: q.id, 
          questionText: q.questionText, 
          hasOptions: !!(q.optionA && q.optionB && q.optionC && q.optionD) 
        })));
        
        // Validate that questions have proper text and options
        const hasValidQuestions = this.questions.some(q => q.questionText && q.optionA && q.optionB && q.optionC && q.optionD);
        if (!hasValidQuestions) {
          console.log('API returned invalid question data, using mock data');
          this.useMockData();
          return;
        }
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading questions:', err);
        console.error('Error details:', err.error);
        console.log('Backend not available, using mock data');
        this.useMockData();
      }
    });
  }

  useMockData(): void {
    console.log('=== USING MOCK EXAM DATA ===');
    this.questions = [
      {
        id: 1,
        questionText: "What is the primary purpose of a constructor in object-oriented programming?",
        optionA: "To destroy objects",
        optionB: "To initialize objects",
        optionC: "To copy objects",
        optionD: "To compare objects",
        correctAnswer: "B",
        branch: "CSE",
        difficulty: "EASY"
      },
      {
        id: 2,
        questionText: "Which of the following is not a JavaScript data type?",
        optionA: "Number",
        optionB: "String",
        optionC: "Float",
        optionD: "Boolean",
        correctAnswer: "C",
        branch: "IT",
        difficulty: "MEDIUM"
      },
      {
        id: 3,
        questionText: "What does CSS stand for?",
        optionA: "Computer Style Sheets",
        optionB: "Creative Style Sheets",
        optionC: "Cascading Style Sheets",
        optionD: "Colorful Style Sheets",
        correctAnswer: "C",
        branch: "CSE",
        difficulty: "EASY"
      },
      {
        id: 4,
        questionText: "Which HTTP status code represents 'Not Found'?",
        optionA: "200",
        optionB: "301",
        optionC: "404",
        optionD: "500",
        correctAnswer: "C",
        branch: "IT",
        difficulty: "MEDIUM"
      },
      {
        id: 5,
        questionText: "What is the time complexity of binary search?",
        optionA: "O(n)",
        optionB: "O(log n)",
        optionC: "O(n²)",
        optionD: "O(1)",
        correctAnswer: "B",
        branch: "CSE",
        difficulty: "HARD"
      },
      {
        id: 6,
        questionText: "What is the function of a diode in electronic circuits?",
        optionA: "To amplify signals",
        optionB: "To allow current flow in one direction",
        optionC: "To store charge",
        optionD: "To resist current flow",
        correctAnswer: "B",
        branch: "EC",
        difficulty: "MEDIUM"
      },
      {
        id: 7,
        questionText: "Which material is commonly used for manufacturing engine blocks?",
        optionA: "Aluminum",
        optionB: "Plastic",
        optionC: "Wood",
        optionD: "Glass",
        correctAnswer: "A",
        branch: "MECHANICAL",
        difficulty: "EASY"
      },
      {
        id: 8,
        questionText: "What is the purpose of a heat exchanger in mechanical systems?",
        optionA: "To generate heat",
        optionB: "To transfer heat between fluids",
        optionC: "To measure temperature",
        optionD: "To filter particles",
        correctAnswer: "B",
        branch: "MECHANICAL",
        difficulty: "MEDIUM"
      }
    ];
    
    console.log('Mock questions loaded:', this.questions);
    console.log('Mock question details:', this.questions.map(q => ({ 
      id: q.id, 
      questionText: q.questionText, 
      hasOptions: !!(q.optionA && q.optionB && q.optionC && q.optionD) 
    })));
    
    this.loading = false;
    console.log('=== MOCK DATA LOADING COMPLETE ===');
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

  retakeTest(): void {
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
