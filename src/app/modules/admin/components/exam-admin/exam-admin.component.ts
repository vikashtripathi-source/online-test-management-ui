import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExamService } from '../../../../shared/services/exam.service';
import { StudentTestRecord } from '../../../../core/models/exam.model';

@Component({
  selector: 'app-exam-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <h1 class="text-3xl font-bold text-gray-800 mb-8">Exam Management</h1>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg shadow-lg p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-pink-100 text-sm">Test Attempts</p>
              <p class="text-4xl font-bold mt-2">{{ testRecords.length }}</p>
            </div>
            <span class="text-5xl opacity-30">📝</span>
          </div>
        </div>

        <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-100 text-sm">Avg Score</p>
              <p class="text-4xl font-bold mt-2">{{ averageScore.toFixed(1) }}%</p>
            </div>
            <span class="text-5xl opacity-30">📊</span>
          </div>
        </div>

        <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-green-100 text-sm">Pass Rate</p>
              <p class="text-4xl font-bold mt-2">{{ passRate.toFixed(1) }}%</p>
            </div>
            <span class="text-5xl opacity-30">✅</span>
          </div>
        </div>
      </div>

      <!-- Records Table -->
      <div class="bg-white rounded-lg shadow-lg p-8">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">🎓 Student Test Records</h2>

        <!-- Filters -->
        <div class="mb-6 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input 
              type="text"
              placeholder="Search by student name..."
              [(ngModel)]="searchTerm"
              class="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500">
            
            <select 
              [(ngModel)]="selectedBranch"
              class="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500">
              <option value="">All Branches</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="MECH">MECH</option>
              <option value="CIVIL">CIVIL</option>
            </select>

            <select 
              [(ngModel)]="sortBy"
              class="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500">
              <option value="date">Sort by Date (Latest)</option>
              <option value="score">Sort by Score (Highest)</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-100 border-b-2 border-gray-300">
              <tr>
                <th class="px-6 py-3 text-left text-sm font-bold text-gray-800">Student Name</th>
                <th class="px-6 py-3 text-left text-sm font-bold text-gray-800">Test Name</th>
                <th class="px-6 py-3 text-left text-sm font-bold text-gray-800">Branch</th>
                <th class="px-6 py-3 text-left text-sm font-bold text-gray-800">Score</th>
                <th class="px-6 py-3 text-left text-sm font-bold text-gray-800">Correct/Total</th>
                <th class="px-6 py-3 text-left text-sm font-bold text-gray-800">Date</th>
                <th class="px-6 py-3 text-left text-sm font-bold text-gray-800">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let record of filteredRecords" class="border-b hover:bg-gray-50 transition">
                <td class="px-6 py-4 text-sm font-semibold text-gray-800">{{ record.studentName }}</td>
                <td class="px-6 py-4 text-sm text-gray-600">{{ record.testName }}</td>
                <td class="px-6 py-4 text-sm">
                  <span class="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                    {{ record.branch }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      class="h-2 rounded-full transition-all"
                      [ngClass]="{
                        'bg-red-500': record.score < 40,
                        'bg-yellow-500': record.score >= 40 && record.score < 70,
                        'bg-green-500': record.score >= 70
                      }"
                      [style.width.%]="record.score">
                    </div>
                  </div>
                  <p class="text-sm font-bold mt-1">{{ record.score }}%</p>
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">
                  {{ record.correctAnswers }}/{{ record.totalQuestions }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">{{ formatDate(record.testDate) }}</td>
                <td class="px-6 py-4">
                  <button 
                    (click)="viewRecord(record)"
                    class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg transition text-sm font-semibold">
                    👁️ View
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div *ngIf="filteredRecords.length === 0" class="text-center py-12">
          <p class="text-gray-500 text-lg">No test records found. 📭</p>
        </div>
      </div>

      <!-- Record Details Modal -->
      <div *ngIf="selectedRecord" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-8">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-800">Test Record Details</h2>
            <button (click)="selectedRecord = null" class="text-2xl text-gray-500 hover:text-gray-800">✕</button>
          </div>

          <div class="space-y-6">
            <!-- Header Info -->
            <div class="bg-gray-50 p-6 rounded-lg">
              <h3 class="text-xl font-bold text-gray-800 mb-4">{{ selectedRecord.studentName }}</h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-600">Test Name</p>
                  <p class="text-lg font-semibold text-gray-800">{{ selectedRecord.testName }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Branch</p>
                  <p class="text-lg font-semibold text-gray-800">{{ selectedRecord.branch }}</p>
                </div>
              </div>
            </div>

            <!-- Score Display -->
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-blue-200">
              <p class="text-sm text-gray-600 mb-2">Overall Score</p>
              <div class="flex items-center gap-4">
                <div class="text-5xl font-bold" [ngClass]="{
                  'text-red-600': selectedRecord.score < 40,
                  'text-yellow-600': selectedRecord.score >= 40 && selectedRecord.score < 70,
                  'text-green-600': selectedRecord.score >= 70
                }">{{ selectedRecord.score }}%</div>
                <div>
                  <p class="text-lg font-semibold">{{ selectedRecord.correctAnswers }}/{{ selectedRecord.totalQuestions }} Correct</p>
                  <p class="text-sm text-gray-600">{{ selectedRecord.totalQuestions - selectedRecord.correctAnswers }} Wrong</p>
                </div>
              </div>
            </div>

            <!-- Test Info -->
            <div>
              <p class="text-sm text-gray-600 mb-3 font-semibold">Test Information</p>
              <div class="space-y-2">
                <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span class="text-sm text-gray-600">Total Questions</span>
                  <span class="font-bold">{{ selectedRecord.totalQuestions }}</span>
                </div>
                <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span class="text-sm text-gray-600">Correct Answers</span>
                  <span class="font-bold text-green-600">{{ selectedRecord.correctAnswers }}</span>
                </div>
                <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span class="text-sm text-gray-600">Wrong Answers</span>
                  <span class="font-bold text-red-600">{{ selectedRecord.totalQuestions - selectedRecord.correctAnswers }}</span>
                </div>
                <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span class="text-sm text-gray-600">Test Date</span>
                  <span class="font-bold">{{ formatDate(selectedRecord.testDate) }}</span>
                </div>
              </div>
            </div>
          </div>

          <button 
            (click)="selectedRecord = null"
            class="w-full mt-6 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition font-semibold">
            Close
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ExamAdminComponent implements OnInit {
  testRecords: StudentTestRecord[] = [];
  selectedRecord: StudentTestRecord | null = null;
  searchTerm = '';
  selectedBranch = '';
  sortBy = 'date';

  constructor(private examService: ExamService) {}

  ngOnInit() {
    this.loadTestRecords();
  }

  loadTestRecords() {
    this.examService.getStudentTestRecords().subscribe({
      next: (records) => {
        this.testRecords = records;
      },
      error: (err) => {
        console.error('Failed to load test records:', err);
      }
    });
  }

  get filteredRecords(): StudentTestRecord[] {
    let filtered = this.testRecords;

    // Apply search filter
    if (this.searchTerm) {
      filtered = filtered.filter(r =>
        r.studentName.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Apply branch filter
    if (this.selectedBranch) {
      filtered = filtered.filter(r => r.branch === this.selectedBranch);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (this.sortBy === 'score') {
        return b.score - a.score;
      } else if (this.sortBy === 'name') {
        return a.studentName.localeCompare(b.studentName);
      } else {
        return new Date(b.testDate).getTime() - new Date(a.testDate).getTime();
      }
    });

    return filtered;
  }

  get averageScore(): number {
    if (this.testRecords.length === 0) return 0;
    const sum = this.testRecords.reduce((acc, r) => acc + r.score, 0);
    return sum / this.testRecords.length;
  }

  get passRate(): number {
    if (this.testRecords.length === 0) return 0;
    const passed = this.testRecords.filter(r => r.score >= 40).length;
    return (passed / this.testRecords.length) * 100;
  }

  viewRecord(record: StudentTestRecord) {
    this.selectedRecord = record;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
