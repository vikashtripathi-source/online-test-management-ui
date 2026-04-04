export interface Question {
  id: number;
  questionText: string;
  question?: string; // Add question field for API compatibility
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  branch: 'MECHANICAL' | 'EC' | 'IT' | 'CSE';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

// DTO for API requests (backend format)
export interface QuestionRequest {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  branch: 'MECHANICAL' | 'EC' | 'IT' | 'CSE';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

export interface SubmitTestRequest {
  studentId: number;
  answers: { questionId: number; selectedAnswer: string }[];
  testTime: number;
}

export interface TestResultResponse {
  studentId: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  score: number;
  percentage: number;
  passed: boolean;
  testDate: string;
}

export interface StudentTestRecord {
  id: number;
  studentId: number;
  studentName: string;
  testName: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  branch: 'MECHANICAL' | 'EC' | 'IT' | 'CSE';
  testDate: string;
}

export interface StudentTestRecordDTO extends StudentTestRecord {}
