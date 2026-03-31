# Admin Panel API Endpoints Documentation

## Overview
Complete API specification for the admin panel features. Create these endpoints in your backend and the admin panel will work seamlessly.

---

## 1. EXAM/QUESTIONS ENDPOINTS

### ✅ Already Implemented (Existing)
These endpoints already exist in your system:

#### GET `/api/exams/questions`
**Description**: Get all questions  
**Method**: GET  
**Response**: Array of Question objects
```json
[
  {
    "id": 1,
    "questionText": "What is 2+2?",
    "optionA": "3",
    "optionB": "4",
    "optionC": "5",
    "optionD": "6",
    "correctAnswer": "B",
    "branch": "CSE",
    "difficulty": "EASY"
  }
]
```

#### POST `/api/exams/questions`
**Description**: Add a new question  
**Method**: POST  
**Request Body**:
```json
{
  "questionText": "string",
  "optionA": "string",
  "optionB": "string",
  "optionC": "string",
  "optionD": "string",
  "correctAnswer": "A|B|C|D",
  "branch": "CSE|ECE|MECH|CIVIL",
  "difficulty": "EASY|MEDIUM|HARD"
}
```
**Response**: Created Question object with ID

#### DELETE `/api/exams/questions/{id}`
**Description**: Delete a question  
**Method**: DELETE  
**Response**: 204 No Content

### 🆕 NEW ENDPOINT NEEDED

#### GET `/api/exams/student-records`
**Description**: Get all student test records  
**Method**: GET  
**Expected Response**: Array of StudentTestRecord objects
```json
[
  {
    "id": 1,
    "studentId": 101,
    "studentName": "John Doe",
    "testName": "Midterm Exam",
    "score": 85,
    "totalQuestions": 20,
    "correctAnswers": 17,
    "branch": "CSE",
    "testDate": "2026-03-25T10:30:00Z"
  }
]
```

**Expected Database Table**: `student_test_records`
| Column Name | Type | Description |
|-------------|------|-------------|
| id | INT PRIMARY KEY | Record ID |
| studentId | INT | Student ID (Foreign Key) |
| studentName | VARCHAR(255) | Student full name |
| testName | VARCHAR(255) | Name of the test |
| score | INT | Score percentage (0-100) |
| totalQuestions | INT | Total questions in test |
| correctAnswers | INT | Number of correct answers |
| branch | VARCHAR(50) | Branch code (CSE/ECE/etc) |
| testDate | TIMESTAMP | Date and time of test |

---

## 2. PRODUCTS ENDPOINTS

### ✅ Already Implemented (Existing)

#### GET `/api/products`
**Description**: Get all products  
**Method**: GET  
**Response**: Array of Product objects

#### POST `/api/products`
**Description**: Create a new product  
**Method**: POST  
**Request Body**:
```json
{
  "name": "string",
  "description": "string",
  "price": 99.99,
  "stockQuantity": 50,
  "branch": "CSE|ECE|MECH|CIVIL",
  "category": "BOOKS|GUIDES|MATERIALS|TOOLS",
  "imageUrl": "string (optional)"
}
```

#### PUT `/api/products/{id}`
**Description**: Update a product  
**Method**: PUT  
**Request Body**: Same as POST

#### DELETE `/api/products/{id}`
**Description**: Delete a product  
**Method**: DELETE  
**Response**: 204 No Content

#### GET `/api/products/inventory`
**Description**: Get inventory status  
**Method**: GET  
**Response**: Array of Product objects with stock info

#### GET `/api/products/inventory/low-stock`
**Description**: Get low stock products (< 10 units)  
**Method**: GET  
**Response**: Array of Product objects with low stock

---

## 3. ORDERS ENDPOINTS

### ✅ Already Implemented (Existing)

#### GET `/api/orders`
**Description**: Get all orders  
**Method**: GET  
**Response**: Array of Order objects
```json
[
  {
    "id": 1,
    "studentId": 101,
    "orderItems": [
      {
        "productId": 5,
        "quantity": 2,
        "price": 29.99
      }
    ],
    "totalAmount": 59.98,
    "status": "PENDING",
    "orderDate": "2026-03-30T14:20:00Z",
    "addressId": 10
  }
]
```

#### GET `/api/orders/{id}`
**Description**: Get a specific order  
**Method**: GET

#### POST `/api/orders`
**Description**: Create an order  
**Method**: POST

#### PUT `/api/orders/{id}`
**Description**: Update an order  
**Method**: PUT

#### DELETE `/api/orders/{id}`
**Description**: Delete an order  
**Method**: DELETE

### 🆕 NEW ENDPOINT NEEDED

#### PUT `/api/orders/{id}/status`
**Description**: Update order status (for order management)  
**Method**: PUT  
**Request Body**:
```json
{
  "status": "PENDING|CONFIRMED|SHIPPED|DELIVERED|CANCELLED"
}
```
**Response**:
```json
{
  "id": 1,
  "studentId": 101,
  "orderItems": [...],
  "totalAmount": 59.98,
  "status": "SHIPPED",
  "orderDate": "2026-03-30T14:20:00Z",
  "addressId": 10
}
```

**Expected Database Table**: `orders`
| Column Name | Type | Description |
|-------------|------|-------------|
| id | INT PRIMARY KEY | Order ID |
| studentId | INT | Student ID |
| totalAmount | DECIMAL(10,2) | Total order amount |
| status | VARCHAR(50) | Order status |
| orderDate | TIMESTAMP | Order creation date |
| addressId | INT | Delivery address ID |

---

## 4. SUMMARY TABLE

### Database Tables Required

#### Table: `student_test_records` (NEW - FOR EXAM ADMIN)
```sql
CREATE TABLE student_test_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  studentId INT NOT NULL,
  studentName VARCHAR(255) NOT NULL,
  testName VARCHAR(255) NOT NULL,
  score INT NOT NULL,
  totalQuestions INT NOT NULL,
  correctAnswers INT NOT NULL,
  branch VARCHAR(50) NOT NULL,
  testDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES students(id)
);
```

#### Existing Tables (Already Used)
- `questions` - For question manager
- `products` - For product admin
- `orders` - For order management
- `order_items` - For order items

---

## ENDPOINT SUMMARY

| Module | Method | Endpoint | Status | Priority |
|--------|--------|----------|--------|----------|
| Questions | GET | `/api/exams/questions` | ✅ Working | - |
| Questions | POST | `/api/exams/questions` | ✅ Working | - |
| Questions | DELETE | `/api/exams/questions/{id}` | ✅ Working | - |
| **Test Records** | **GET** | **`/api/exams/student-records`** | **🆕 NEW** | **HIGH** |
| Products | GET | `/api/products` | ✅ Working | - |
| Products | POST | `/api/products` | ✅ Working | - |
| Products | PUT | `/api/products/{id}` | ✅ Working | - |
| Products | DELETE | `/api/products/{id}` | ✅ Working | - |
| Products | GET | `/api/products/inventory` | ✅ Working | - |
| Products | GET | `/api/products/inventory/low-stock` | ✅ Working | - |
| Orders | GET | `/api/orders` | ✅ Working | - |
| Orders | GET | `/api/orders/{id}` | ✅ Working | - |
| Orders | POST | `/api/orders` | ✅ Working | - |
| Orders | PUT | `/api/orders/{id}` | ✅ Working | - |
| Orders | DELETE | `/api/orders/{id}` | ✅ Working | - |
| **Orders** | **PUT** | **`/api/orders/{id}/status`** | **🆕 NEW** | **MEDIUM** |

---

## Models/Interfaces

### Question (Already Exists)
```typescript
interface Question {
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
```

### Product (Already Exists)
```typescript
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  branch: string;
  category: string;
  imageUrl?: string;
}
```

### Order (Already Exists)
```typescript
interface Order {
  id: number;
  studentId: number;
  orderItems: OrderItem[];
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  orderDate: string;
  addressId?: number;
}

interface OrderItem {
  productId: number;
  quantity: number;
  price: number;
}
```

### StudentTestRecord (NEW - For Exam Admin)
```typescript
interface StudentTestRecord {
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
```

---

## Testing Instructions

### For Now (Until Backend is Ready)
The admin panel is **fully functional** but will show mock/empty data until you create the backend endpoints.

### Step-by-Step Testing

1. **Login to App**
   - Register or login as a student
   - You'll be redirected to dashboard

2. **Access Admin Panel**
   - Look for **"⚙️ Admin Panel"** button in header
   - Click it to enter admin module

3. **Test Each Section**
   - **Dashboard**: View statistics (will be 0 until data exists)
   - **Questions**: Try adding a question (will work with existing endpoint)
   - **Products**: Try adding a product (will work with existing endpoint)
   - **Orders**: View orders (will be empty until orders exist)
   - **Exams**: View test records (will be empty - needs new endpoint)

### Expected Behavior Now
- ✅ Questions work (using existing API)
- ✅ Products work (using existing API)
- ✅ Orders show table but might be empty (using existing API)
- ⚠️ Exams tab will fail (needs new `/api/exams/student-records` endpoint)

---

## Backend Implementation Checklist

### Priority 1 (CRITICAL - Required for Exam Admin to work)
- [ ] Create `GET /api/exams/student-records` endpoint
- [ ] Create `student_test_records` table
- [ ] Add columns: id, studentId, studentName, testName, score, totalQuestions, correctAnswers, branch, testDate

### Priority 2 (IMPORTANT - For Order status updates)
- [ ] Create `PUT /api/orders/{id}/status` endpoint
- [ ] Ensure orders table has `status` column with values: PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED

### Priority 3 (Optional - For better data)
- [ ] Populate sample test records
- [ ] Ensure inventory endpoint returns low stock data

---

## Sample cURL Commands for Testing

### Get All Questions
```bash
curl -X GET http://localhost:8089/api/exams/questions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Add a Question
```bash
curl -X POST http://localhost:8089/api/exams/questions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "questionText": "What is Angular?",
    "optionA": "JavaScript Framework",
    "optionB": "CSS Library",
    "optionC": "Database",
    "optionD": "HTTP Protocol",
    "correctAnswer": "A",
    "branch": "CSE",
    "difficulty": "EASY"
  }'
```

### Update Order Status
```bash
curl -X PUT http://localhost:8089/api/orders/1/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "SHIPPED"}'
```

### Get Student Test Records (NEW)
```bash
curl -X GET http://localhost:8089/api/exams/student-records \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Notes

✅ **All UI is ready** - Admin panel is fully functional  
⚠️ **API endpoints needed** - 2 new endpoints must be created  
📝 **Error handling** - UI will handle errors gracefully  
🔄 **Real-time updates** - Data updates immediately after operations  

---

**Pass this document to your backend team to implement the required endpoints!**
