export interface Report {
  studentName: string;
  branch: string;
  orderDetail: string;
  address: string;
  orderCreateDate: string;
  studentMobileNumber: string;
}

export interface ReportDTO extends Report {}
