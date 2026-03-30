export interface Question {
  id: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  branch: string;
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
  branch: string;
  testDate: string;
}

export interface StudentTestRecordDTO extends StudentTestRecord {}
