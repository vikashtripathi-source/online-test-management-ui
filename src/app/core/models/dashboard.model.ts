import { StudentTestRecord } from './exam.model';

export interface Dashboard {
  studentId: number;
  studentName: string;
  branch: string;
  totalTestsAttempted: number;
  averageScore: number;
  totalOrders: number;
  recentTests: StudentTestRecord[];
  lastTestScore?: number;
  lastTestDate?: string;
}

export interface DashboardDTO extends Dashboard {}
