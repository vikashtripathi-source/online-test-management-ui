export interface Student {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  branch: string;
  mobileNumber: string;
  imageUrl?: string;
}

export interface StudentDTO extends Student {
  password?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface JwtResponse {
  token: string;
  student: Student;
}
