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

export interface QuestionDTO extends Question {}
