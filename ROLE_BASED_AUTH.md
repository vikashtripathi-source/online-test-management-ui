# Role-Based Authentication Implementation

## Overview
The application now supports role-based authentication with a single login page. Users are routed to different dashboards based on their role.

## Architecture

### Authentication Flow

```
User Input (Email + Password)
        ↓
    LoginComponent
        ↓
StudentService.login() [POST /students/login]
        ↓
Backend Returns: { token, student: { ...data, role } }
        ↓
Store token & student data in localStorage
        ↓
Check user.role
        ↓
    ┌─────────────────────────┬────────────────────┐
    ↓                         ↓                    ↓
role=ADMIN          role=STUDENT            No role specified
    ↓                         ↓                    ↓
/admin/dashboard      /dashboard            /dashboard (default)
```

### Files Modified

#### 1. **Student Model** [src/app/core/models/student.model.ts]
```typescript
export type UserRole = 'STUDENT' | 'ADMIN' | 'TEACHER' | 'MANAGER';

export interface Student {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  branch: string;
  mobileNumber: string;
  imageUrl?: string;
  role?: UserRole;  // NEW: Supports multiple roles
}
```

**Supported Roles:**
- `ADMIN` - Full access to admin panel
- `TEACHER` - Admin panel access (same as ADMIN)
- `MANAGER` - Admin panel access (same as ADMIN)
- `STUDENT` - Basic student dashboard only
- `undefined/null` - Defaults to student dashboard

#### 2. **Login Component** [src/app/modules/auth/login/login.ts]
```typescript
login() {
  this.studentService.login(this.form).subscribe({
    next: (response) => {
      // Get user role and route accordingly
      const userRole = response.student?.role || 'STUDENT';
      
      if (userRole === 'ADMIN' || userRole === 'TEACHER' || userRole === 'MANAGER') {
        this.router.navigate(['/admin/dashboard']);  // Admin routing
      } else {
        this.router.navigate(['/dashboard']);  // Student routing
      }
    },
    error: (error) => { /* error handling */ }
  });
}
```

**Key Changes:**
- ✅ Checks `response.student?.role` after successful login
- ✅ Routes to `/admin/dashboard` for admin users
- ✅ Routes to `/dashboard` for student users
- ✅ Defaults to STUDENT role if not specified
- ✅ Added console logging for debugging

#### 3. **Header Component** [src/app/layout/header/header.ts]
```typescript
export class HeaderComponent implements OnInit {
  isAdmin = false;
  currentUser: Student | null = null;

  ngOnInit() {
    this.studentService.getCurrentStudent().subscribe(student => {
      this.currentUser = student;
      this.isAdmin = this.checkIsAdmin(student?.role);
    });
  }

  checkIsAdmin(role?: UserRole): boolean {
    return role === 'ADMIN' || role === 'TEACHER' || role === 'MANAGER';
  }
}
```

**Features:**
- ✅ Checks current user role on component initialization
- ✅ Subscribe to currentStudent$ for real-time updates
- ✅ Determine admin status via `checkIsAdmin()` method

#### 4. **Header Template** [src/app/layout/header/header.html]
```html
<div class="flex gap-3 items-center">
  <!-- Show Admin Panel only for admin users -->
  <a 
    *ngIf="isAdmin"
    routerLink="/admin"
    class="...">
    ⚙️ Admin Panel
  </a>
  
  <!-- Show current user role -->
  <div *ngIf="currentUser">
    <span *ngIf="isAdmin">{{ currentUser.firstName }} (Admin)</span>
    <span *ngIf="!isAdmin">{{ currentUser.firstName }} (Student)</span>
  </div>
  
  <button (click)="logout()">Logout</button>
</div>
```

**Features:**
- ✅ Admin Panel button only visible for admin users (`*ngIf="isAdmin"`)
- ✅ Display user name with role indicator
- ✅ Logout button for both user types

#### 5. **Student Service** [src/app/shared/services/student.service.ts]
```typescript
login(credentials: LoginRequest): Observable<any> {
  return this.post<any>('/students/login', credentials).pipe(
    tap(response => {
      // Save token
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      // Save student data with role
      if (response.student) {
        localStorage.setItem('student', JSON.stringify(response.student));
        this.currentStudent$.next(response.student);
        console.log('[StudentService] Login - Student saved with role:', response.student.role);
      }
    })
  );
}

getCurrentStudent(): Observable<Student | null> {
  return this.currentStudent$.asObservable();
}
```

**Key Features:**
- ✅ Stores student data including role in localStorage
- ✅ Maintains BehaviorSubject for reactive updates
- ✅ Provides `getCurrentStudent()` for header and other components

#### 6. **Admin Component** [src/app/modules/admin/admin.component.ts]
```typescript
export class AdminComponent implements OnInit {
  currentUser: Student | null = null;

  ngOnInit() {
    this.studentService.getCurrentStudent().subscribe(student => {
      this.currentUser = student;
      console.log('[AdminComponent] Current user:', student);
    });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('student');
    this.router.navigate(['/login']);
  }
}
```

**Features:**
- ✅ Display current admin user info
- ✅ Show user role in admin header
- ✅ Clean logout handling

## Test Scenarios

### Scenario 1: Admin User Login
```
User Email: admin@example.com
User Role (returned from API): ADMIN
Expected Behavior:
  ✓ Login succeeds
  ✓ Redirects to /admin/dashboard
  ✓ Admin Panel button visible in header
  ✓ Can access all admin features
```

### Scenario 2: Student User Login
```
User Email: student@example.com
User Role (returned from API): STUDENT (or undefined)
Expected Behavior:
  ✓ Login succeeds
  ✓ Redirects to /dashboard
  ✓ Admin Panel button NOT visible in header
  ✓ Can only access student dashboard
```

### Scenario 3: Teacher/Manager Login
```
User Email: teacher@example.com
User Role (returned from API): TEACHER or MANAGER
Expected Behavior:
  ✓ Login succeeds
  ✓ Redirects to /admin/dashboard
  ✓ Admin Panel button visible in header
  ✓ Can access admin features
```

## Backend Requirements

### Login Endpoint Response
The backend's `POST /students/login` endpoint must return:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "student": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "branch": "CSE",
    "mobileNumber": "9876543210",
    "imageUrl": "https://...",
    "role": "ADMIN"  // REQUIRED for role-based routing
  }
}
```

### Important Notes
- ⚠️ The `role` field is **optional** but recommended
- ✅ If `role` is missing, the user defaults to STUDENT
- ✅ Supported role values: `ADMIN`, `TEACHER`, `MANAGER`, `STUDENT`
- ✅ Role values are **case-sensitive**

## localStorage Structure

After successful login, localStorage contains:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "student": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "branch": "CSE",
    "mobileNumber": "9876543210",
    "imageUrl": "https://...",
    "role": "ADMIN"
  }
}
```

## Console Logging for Debugging

The implementation includes detailed console logging:

```
[LoginComponent] User role: ADMIN
[LoginComponent] Routing to admin dashboard...

[HeaderComponent] User role: ADMIN Is Admin: true

[StudentService] Login - Student saved with role: ADMIN

[AdminComponent] Current user: {id: 1, role: "ADMIN", ...}
```

## How to Test

### Using curl (Test Admin Login)
```bash
curl -X POST http://localhost:8080/api/students/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'

# Response should include:
# {
#   "token": "...",
#   "student": {
#     "role": "ADMIN",
#     ...
#   }
# }
```

### Using Frontend
1. Start the application: `npm start`
2. Navigate to login page
3. Login with admin credentials
4. Verify:
   - ✓ Redirects to `/admin/dashboard`
   - ✓ Admin Panel button visible in header
   - ✓ All admin features accessible
5. Logout and login with student credentials
6. Verify:
   - ✓ Redirects to `/dashboard`
   - ✓ Admin Panel button NOT visible in header
   - ✓ Only student features visible

## Common Issues & Troubleshooting

### Issue: Admin button not showing
**Cause:** User's role is not being returned by backend
**Solution:** Check backend login response includes `role` field

### Issue: Redirecting to wrong dashboard
**Cause:** Role value doesn't match expected values
**Solution:** Verify role is one of: ADMIN, TEACHER, MANAGER, STUDENT (case-sensitive)

### Issue: Can't access admin panel after login
**Cause:** Role field is missing in localStorage
**Solution:** Ensure backend returns student object with role field

## Files Modified Summary

| File | Changes |
|------|---------|
| [student.model.ts](src/app/core/models/student.model.ts) | Added UserRole type and role field to Student |
| [login.ts](src/app/modules/auth/login/login.ts) | Role-based conditional routing |
| [header.ts](src/app/layout/header/header.ts) | Role checking and admin visibility |
| [header.html](src/app/layout/header/header.html) | Conditional admin button rendering |
| [student.service.ts](src/app/shared/services/student.service.ts) | Store role in localStorage |
| [admin.component.ts](src/app/modules/admin/admin.component.ts) | Display current user role |

## Summary
✅ **Role-based authentication fully implemented**
- Single login page for all users
- Dynamic dashboard routing based on role
- Conditional admin button visibility
- Support for multiple admin roles (ADMIN, TEACHER, MANAGER)
- Full localStorage persistence
- TypeScript strict mode compliant
- No compilation errors
