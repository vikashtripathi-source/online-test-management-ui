# Registration & Authentication APIs Documentation

## Table of Contents
1. [Student Registration API](#student-registration-api)
2. [Admin Registration API](#admin-registration-api)
3. [Login API](#login-api)
4. [Implementation Guide](#implementation-guide)

---

## Student Registration API

### Endpoint
```
POST /api/students/register
```

### Description
Register a new student user for the college portal.

### Request Headers
```
Content-Type: application/json
```

### Request Body
```json
{
  "email": "john.student@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Student",
  "branch": "CSE",
  "mobileNumber": "9876543210",
  "imageUrl": "https://example.com/image.jpg",
  "role": "STUDENT"
}
```

### Request Body Fields

| Field | Type | Required | Validation | Description |
|-------|------|----------|-----------|-------------|
| email | String | Yes | Valid email format, Unique | Student email address |
| password | String | Yes | Min 6 characters | Login password (should be hashed on backend) |
| firstName | String | Yes | Min 1, Max 50 chars | First name of student |
| lastName | String | Yes | Min 1, Max 50 chars | Last name of student |
| branch | String | Yes | One of: CSE, ECE, Mechanical, Civil, Electrical | Department/Branch of student |
| mobileNumber | String | Yes | Exactly 10 digits | Contact number |
| imageUrl | String | No | Valid URL or null | Profile picture URL |
| role | String | Yes | **Always "STUDENT"** | Role type (frontend sets this) |

### Success Response (201 Created)
```json
{
  "id": 1,
  "email": "john.student@example.com",
  "firstName": "John",
  "lastName": "Student",
  "branch": "CSE",
  "mobileNumber": "9876543210",
  "imageUrl": "https://example.com/image.jpg",
  "role": "STUDENT",
  "createdAt": "2024-03-31T10:30:00Z"
}
```

### Error Responses

#### 400 Bad Request
```json
{
  "status": 400,
  "message": "Email already registered",
  "timestamp": "2024-03-31T10:30:00Z"
}
```

**Possible 400 errors:**
- `Email already registered`
- `Invalid email format`
- `Password must be at least 6 characters`
- `Mobile number must be 10 digits`
- `First name is required`
- `Last name is required`
- `Branch is required`

#### 500 Internal Server Error
```json
{
  "status": 500,
  "message": "Internal server error",
  "timestamp": "2024-03-31T10:30:00Z"
}
```

### Example cURL Request
```bash
curl -X POST http://localhost:8089/api/students/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.student@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Student",
    "branch": "CSE",
    "mobileNumber": "9876543210",
    "role": "STUDENT"
  }'
```

### Java Spring Boot Implementation Example
```java
@PostMapping("/register")
public ResponseEntity<?> registerStudent(@RequestBody StudentDTO studentDTO) {
    // Validation
    if (studentRepository.existsByEmail(studentDTO.getEmail())) {
        return ResponseEntity.badRequest()
            .body(new ErrorResponse("Email already registered", 400));
    }
    
    if (!validateEmail(studentDTO.getEmail())) {
        return ResponseEntity.badRequest()
            .body(new ErrorResponse("Invalid email format", 400));
    }
    
    if (studentDTO.getPassword().length() < 6) {
        return ResponseEntity.badRequest()
            .body(new ErrorResponse("Password must be at least 6 characters", 400));
    }
    
    if (!studentDTO.getMobileNumber().matches("\\d{10}")) {
        return ResponseEntity.badRequest()
            .body(new ErrorResponse("Mobile number must be 10 digits", 400));
    }
    
    // Create student with STUDENT role
    Student student = new Student();
    student.setEmail(studentDTO.getEmail());
    student.setPassword(passwordEncoder.encode(studentDTO.getPassword()));
    student.setFirstName(studentDTO.getFirstName());
    student.setLastName(studentDTO.getLastName());
    student.setBranch(studentDTO.getBranch());
    student.setMobileNumber(studentDTO.getMobileNumber());
    student.setImageUrl(studentDTO.getImageUrl());
    student.setRole(StudentRole.STUDENT); // Always STUDENT
    
    Student savedStudent = studentRepository.save(student);
    return ResponseEntity.status(201).body(savedStudent);
}
```

---

## Admin Registration API ⭐ (NEW)

### Endpoint
```
POST /api/students/register/admin
```

### Description
Register a new teacher/admin/manager user with secret code validation.

### Request Headers
```
Content-Type: application/json
```

### Request Body
```json
{
  "email": "dr.smith@example.com",
  "password": "securepassword123",
  "firstName": "Dr.",
  "lastName": "Smith",
  "branch": "CSE",
  "mobileNumber": "9876543211",
  "imageUrl": "https://example.com/teacher.jpg",
  "role": "TEACHER",
  "adminCode": "AUTH_SECRET_CODE_2024"
}
```

### Request Body Fields

| Field | Type | Required | Validation | Description |
|-------|------|----------|-----------|-------------|
| email | String | Yes | Valid email format, Unique | Admin/Teacher email address |
| password | String | Yes | Min 6 characters | Login password (should be hashed on backend) |
| firstName | String | Yes | Min 1, Max 50 chars | First name of teacher/admin |
| lastName | String | Yes | Min 1, Max 50 chars | Last name of teacher/admin |
| branch | String | Yes | One of: CSE, ECE, Mechanical, Civil, Electrical | Department/Branch of teacher |
| mobileNumber | String | Yes | Exactly 10 digits | Contact number |
| imageUrl | String | No | Valid URL or null | Profile picture URL |
| role | String | Yes | One of: TEACHER, ADMIN, MANAGER | **User chooses their role** |
| adminCode | String | Yes | **Must match secret code** | Secret code for validation (CRITICAL) |

### Success Response (201 Created)
```json
{
  "id": 2,
  "email": "dr.smith@example.com",
  "firstName": "Dr.",
  "lastName": "Smith",
  "branch": "CSE",
  "mobileNumber": "9876543211",
  "imageUrl": "https://example.com/teacher.jpg",
  "role": "TEACHER",
  "createdAt": "2024-03-31T10:35:00Z"
}
```

### Error Responses

#### 400 Bad Request - Invalid Admin Code
```json
{
  "status": 400,
  "message": "Invalid admin code",
  "timestamp": "2024-03-31T10:35:00Z"
}
```

#### 400 Bad Request - Email Already Exists
```json
{
  "status": 400,
  "message": "Email already registered",
  "timestamp": "2024-03-31T10:35:00Z"
}
```

#### 400 Bad Request - Missing Fields
```json
{
  "status": 400,
  "message": "Password must be at least 6 characters",
  "timestamp": "2024-03-31T10:35:00Z"
}
```

**Possible 400 errors:**
- `Invalid admin code` ⚠️ (Wrong secret code)
- `Email already registered`
- `Invalid email format`
- `Password must be at least 6 characters`
- `Mobile number must be 10 digits`
- `Invalid role selected`
- `All required fields must be provided`

#### 403 Forbidden - Admin Code Invalid
```json
{
  "status": 403,
  "message": "Unauthorized: Invalid admin registration code",
  "timestamp": "2024-03-31T10:35:00Z"
}
```

#### 500 Internal Server Error
```json
{
  "status": 500,
  "message": "Internal server error",
  "timestamp": "2024-03-31T10:35:00Z"
}
```

### Example cURL Request
```bash
curl -X POST http://localhost:8089/api/students/register/admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dr.smith@example.com",
    "password": "securepassword123",
    "firstName": "Dr.",
    "lastName": "Smith",
    "branch": "CSE",
    "mobileNumber": "9876543211",
    "role": "TEACHER",
    "adminCode": "AUTH_SECRET_CODE_2024"
  }'
```

### Java Spring Boot Implementation Example
```java
@PostMapping("/register/admin")
public ResponseEntity<?> registerAdmin(@RequestBody AdminRegistrationDTO adminDTO) {
    // CRITICAL: Validate admin code
    String adminSecretCode = System.getenv("ADMIN_REGISTRATION_CODE");
    if (adminSecretCode == null) {
        adminSecretCode = "AUTH_SECRET_CODE_2024"; // Default for development
    }
    
    if (!adminDTO.getAdminCode().equals(adminSecretCode)) {
        return ResponseEntity.status(400)
            .body(new ErrorResponse("Invalid admin code", 400));
    }
    
    // Validate email uniqueness
    if (studentRepository.existsByEmail(adminDTO.getEmail())) {
        return ResponseEntity.badRequest()
            .body(new ErrorResponse("Email already registered", 400));
    }
    
    if (!validateEmail(adminDTO.getEmail())) {
        return ResponseEntity.badRequest()
            .body(new ErrorResponse("Invalid email format", 400));
    }
    
    if (adminDTO.getPassword().length() < 6) {
        return ResponseEntity.badRequest()
            .body(new ErrorResponse("Password must be at least 6 characters", 400));
    }
    
    if (!adminDTO.getMobileNumber().matches("\\d{10}")) {
        return ResponseEntity.badRequest()
            .body(new ErrorResponse("Mobile number must be 10 digits", 400));
    }
    
    // Validate role
    StudentRole role;
    try {
        role = StudentRole.valueOf(adminDTO.getRole());
        if (role == StudentRole.STUDENT) {
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("Cannot register STUDENT through admin endpoint", 400));
        }
    } catch (IllegalArgumentException e) {
        return ResponseEntity.badRequest()
            .body(new ErrorResponse("Invalid role: " + adminDTO.getRole(), 400));
    }
    
    // Create admin user
    Student student = new Student();
    student.setEmail(adminDTO.getEmail());
    student.setPassword(passwordEncoder.encode(adminDTO.getPassword()));
    student.setFirstName(adminDTO.getFirstName());
    student.setLastName(adminDTO.getLastName());
    student.setBranch(adminDTO.getBranch());
    student.setMobileNumber(adminDTO.getMobileNumber());
    student.setImageUrl(adminDTO.getImageUrl());
    student.setRole(role); // User-selected role
    
    Student savedStudent = studentRepository.save(student);
    return ResponseEntity.status(201).body(savedStudent);
}
```

---

## Login API

### Endpoint
```
POST /api/students/login
```

### Description
Login with email and password. Returns JWT token and student information.

### Request Headers
```
Content-Type: application/json
```

### Request Body
```json
{
  "email": "john.student@example.com",
  "password": "password123"
}
```

### Request Body Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | String | Yes | Student/Admin email |
| password | String | Yes | Login password |

### Success Response (200 OK)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
  "student": {
    "id": 1,
    "email": "john.student@example.com",
    "firstName": "John",
    "lastName": "Student",
    "branch": "CSE",
    "mobileNumber": "9876543210",
    "imageUrl": "https://example.com/image.jpg",
    "role": "STUDENT",
    "createdAt": "2024-03-31T10:30:00Z"
  }
}
```

### Error Responses

#### 401 Unauthorized - Invalid Credentials
```json
{
  "status": 401,
  "message": "Invalid email or password",
  "timestamp": "2024-03-31T10:40:00Z"
}
```

#### 400 Bad Request
```json
{
  "status": 400,
  "message": "Email and password are required",
  "timestamp": "2024-03-31T10:40:00Z"
}
```

### Example cURL Request
```bash
curl -X POST http://localhost:8089/api/students/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.student@example.com",
    "password": "password123"
  }'
```

### Java Spring Boot Implementation Example
```java
@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
    // Validate input
    if (!StringUtils.hasText(loginRequest.getEmail()) || 
        !StringUtils.hasText(loginRequest.getPassword())) {
        return ResponseEntity.badRequest()
            .body(new ErrorResponse("Email and password are required", 400));
    }
    
    // Find student by email
    Student student = studentRepository.findByEmail(loginRequest.getEmail());
    if (student == null) {
        return ResponseEntity.status(401)
            .body(new ErrorResponse("Invalid email or password", 401));
    }
    
    // Verify password
    if (!passwordEncoder.matches(loginRequest.getPassword(), student.getPassword())) {
        return ResponseEntity.status(401)
            .body(new ErrorResponse("Invalid email or password", 401));
    }
    
    // Generate JWT token
    String token = jwtTokenProvider.generateToken(student);
    
    // Return response with token and student info
    JwtResponse jwtResponse = new JwtResponse();
    jwtResponse.setToken(token);
    jwtResponse.setStudent(student);
    
    return ResponseEntity.ok(jwtResponse);
}
```

---

## Implementation Guide

### Step 1: Create Database Models

#### Student Entity
```java
@Entity
@Table(name = "students")
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false)
    private String firstName;
    
    @Column(nullable = false)
    private String lastName;
    
    @Column(nullable = false)
    private String branch;
    
    @Column(nullable = false)
    private String mobileNumber;
    
    private String imageUrl;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StudentRole role; // STUDENT, TEACHER, ADMIN, MANAGER
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    // Getters and Setters
}
```

#### StudentRole Enum
```java
public enum StudentRole {
    STUDENT("Student"),
    TEACHER("Teacher"),
    ADMIN("Admin"),
    MANAGER("Manager");
    
    private String displayName;
    
    StudentRole(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
```

### Step 2: Create DTOs

#### StudentDTO
```java
public class StudentDTO {
    private Long id;
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private String branch;
    private String mobileNumber;
    private String imageUrl;
    private String role;
    
    // Getters and Setters
}
```

#### AdminRegistrationDTO
```java
public class AdminRegistrationDTO {
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private String branch;
    private String mobileNumber;
    private String imageUrl;
    private String role; // TEACHER, ADMIN, MANAGER
    private String adminCode; // Secret code for validation
    
    // Getters and Setters
}
```

#### LoginRequest
```java
public class LoginRequest {
    private String email;
    private String password;
    
    // Getters and Setters
}
```

#### JwtResponse
```java
public class JwtResponse {
    private String token;
    private Student student;
    
    // Getters and Setters
}
```

### Step 3: Create Repository Interface

```java
@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Student findByEmail(String email);
    boolean existsByEmail(String email);
}
```

### Step 4: Environment Variables

**For Production/Development:**

**application.properties:**
```properties
# Admin Registration Secret Code
admin.registration.code=YOUR_SECRET_CODE_HERE

# Or via environment variable:
# export ADMIN_REGISTRATION_CODE=YOUR_SECRET_CODE_HERE
```

**application.yml:**
```yaml
admin:
  registration:
    code: ${ADMIN_REGISTRATION_CODE:AUTH_SECRET_CODE_2024}
```

### Step 5: Update Controller

```java
@RestController
@RequestMapping("/api/students")
public class StudentController {
    
    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    @Value("${admin.registration.code}")
    private String adminSecretCode;
    
    // Include the registerStudent, registerAdmin, and login methods
    // as shown in the examples above
}
```

---

## API Summary Table

| API | Method | Endpoint | Auth Required | Purpose |
|-----|--------|----------|---------------|---------|
| Student Register | POST | `/api/students/register` | No | Register as student |
| Admin Register | POST | `/api/students/register/admin` | No | Register as teacher/admin (with code) |
| Login | POST | `/api/students/login` | No | Login and get JWT token |
| Get Student | GET | `/api/students/{id}` | Yes | Get student details |
| Update Student | PUT | `/api/students/{id}` | Yes | Update student info |

---

## Error Codes Reference

| Code | Meaning | Action |
|------|---------|--------|
| 201 | Created | Registration successful |
| 200 | OK | Request successful |
| 400 | Bad Request | Invalid input, validation failed |
| 401 | Unauthorized | Invalid credentials |
| 403 | Forbidden | Admin code invalid |
| 409 | Conflict | Email already exists |
| 500 | Server Error | Internal server error |

---

## Security Notes

### Password Storage
- ⚠️ **NEVER** store plain text passwords
- Use `BCryptPasswordEncoder` or similar
- Example: `passwordEncoder.encode(password)`

### Admin Code
- Store as environment variable: `ADMIN_REGISTRATION_CODE`
- **Don't hardcode** in source code
- Rotate periodically for security
- Example valid codes:
  - `AUTH_SECRET_CODE_2024`
  - `TeacherAdmin@SecureCode123`
  - `College#Register_AdminOnly_2024`

### JWT Token
- Include student ID and role in JWT payload
- Set expiration time (e.g., 24 hours)
- Use HS256 or RS256 algorithm
- Include Bearer scheme in requests: `Authorization: Bearer <token>`

### Email Validation
- Verify email format: `user@domain.com`
- Ensure email uniqueness in database

### CORS Configuration
```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("http://localhost:4200")
                    .allowedMethods("GET", "POST", "PUT", "DELETE")
                    .allowedHeaders("*")
                    .allowCredentials(true);
            }
        };
    }
}
```

---

## Testing the APIs

### Postman Collection Ready
Save as `.json` and import into Postman:

```json
{
  "info": {
    "name": "Registration APIs",
    "version": "1.0"
  },
  "item": [
    {
      "name": "Student Register",
      "request": {
        "method": "POST",
        "url": "http://localhost:8089/api/students/register",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "raw": "{\"email\": \"student@example.com\", \"password\": \"pass123\", \"firstName\": \"John\", \"lastName\": \"Doe\", \"branch\": \"CSE\", \"mobileNumber\": \"9876543210\", \"role\": \"STUDENT\"}"
        }
      }
    },
    {
      "name": "Admin Register",
      "request": {
        "method": "POST",
        "url": "http://localhost:8089/api/students/register/admin",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "raw": "{\"email\": \"teacher@example.com\", \"password\": \"pass123\", \"firstName\": \"Dr.\", \"lastName\": \"Smith\", \"branch\": \"CSE\", \"mobileNumber\": \"9876543211\", \"role\": \"TEACHER\", \"adminCode\": \"YOUR_SECRET_CODE_HERE\"}"
        }
      }
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "url": "http://localhost:8089/api/students/login",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "raw": "{\"email\": \"student@example.com\", \"password\": \"pass123\"}"
        }
      }
    }
  ]
}
```

---

✅ **All APIs documented with examples and implementation guides!**
