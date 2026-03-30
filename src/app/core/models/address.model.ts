export interface Address {
  id: number;
  studentId: number;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  type: 'HOME' | 'COLLEGE';
}

export interface AddressDTO extends Address {}
