# Admin Panel Testing Guide

## 🚀 How to Test the Admin Panel

---

## Step 1: Login to Application

1. Start your development server: `npm start`
2. Go to `http://localhost:4200/login`
3. Enter credentials (register if needed)
4. After login, you'll see the dashboard

---

## Step 2: Access Admin Panel

### Method 1: Click Button
1. Look at the top header
2. Find **"⚙️ Admin Panel"** button (next to Logout)
3. Click it to enter admin panel

### Method 2: Direct URL
Navigate to: `http://localhost:4200/admin/dashboard`

---

## Step 3: Test Each Module

### 📊 DASHBOARD

**What You'll See:**
- 4 stat cards (total products, questions, orders, users)
- Quick stats section
- System info section

**Status:**
- ✅ **Working now** - Shows zeroes until data exists
- ✅ **Click Dashboard** from sidebar to load it

**Test Steps:**
```
1. Click Dashboard in sidebar
2. Look for 4 colored cards
3. View quick stats below
4. Confirm responsive design
```

---

### ❓ QUESTIONS

**What You'll See:**
- Form to add new question
- List of all questions below

**Status:**
- ✅ **Fully Working** - Add/delete questions now
- ✅ **Uses existing API**: `/api/exams/questions`

**Test Steps:**
```
1. Click "Questions" in sidebar
2. Fill in the form:
   - Question Text: "What is 2+2?"
   - Option A: "3"
   - Option B: "4" ← Select as correct
   - Option C: "5"
   - Option D: "6"
   - Branch: "CSE"
   - Difficulty: "EASY"
3. Click "Add Question" button
4. You should see success message ✅
5. Question appears in list below
6. Try deleting a question
```

**Fields:**
- Question Text (required)
- Option A, B, C, D (required)
- Correct Answer (A|B|C|D)
- Branch (CSE|ECE|MECH|CIVIL)
- Difficulty (EASY|MEDIUM|HARD)

---

### 📦 PRODUCTS

**What You'll See:**
- Form to add product
- Grid view of all products

**Status:**
- ✅ **Fully Working** - Add/delete products now
- ✅ **Uses existing API**: `/api/products`

**Test Steps:**
```
1. Click "Products" in sidebar
2. Fill in the form:
   - Product Name: "C++ Textbook"
   - Description: "Complete guide to C++"
   - Price: "29.99"
   - Stock Quantity: "50"
   - Category: "BOOKS"
   - Branch: "CSE"
   - Image URL: (optional) "https://example.com/image.jpg"
3. Click "Add Product" button
4. You should see success message ✅
5. Product appears in grid below
6. Try searching products
7. Try filtering by category
```

**Stock Level Indicators:**
- 🔴 Red: Low stock (< 10 units)
- 🟡 Yellow: Medium stock (10-50 units)
- 🟢 Green: High stock (> 50 units)

---

### 🛒 ORDERS

**What You'll See:**
- Order statistics cards
- Table of all orders
- Order status filter

**Status:**
- ⚠️ **Partially Working** - Orders table works
- ✅ **View orders**: `/api/orders` works
- ❌ **Update status**: Needs new endpoint `/api/orders/{id}/status`

**Test Steps:**
```
1. Click "Orders" in sidebar
2. You'll see stat cards:
   - Total Orders
   - Pending Orders
   - Delivered Orders
   - Total Revenue

3. Below that, order table:
   - Shows all orders
   - Click "View" to see details in modal
   - Try filtering by status dropdown

4. To test status update:
   - Click "View" on an order
   - Modal opens
   - Try changing status (will fail until API created)
```

**Status Filter:**
- All Status
- PENDING (yellow)
- CONFIRMED (blue)
- SHIPPED (purple)
- DELIVERED (green)
- CANCELLED (red)

---

### 📝 EXAMS

**What You'll See:**
- Test record statistics
- Student test records table
- Search, filter, sort options

**Status:**
- ❌ **Not Working Yet** - Needs backend support
- ❌ **Requires new endpoint**: `/api/exams/student-records`
- ❌ **Requires table**: `student_test_records`

**Test Steps:**
```
1. Click "Exams" in sidebar
2. You'll see the layout but NO DATA
3. This is expected - backend endpoint not created yet
4. Once you create the API endpoint, this will show data
```

**What Will Work After API Is Created:**
- View all student test records
- Search by student name
- Filter by branch
- Sort by date/score/name
- See test performance metrics
- View detailed records in modal

---

## Common Issues & Solutions

### Issue 1: Admin Panel Button Not Showing

**Solution:**
1. Make sure you're logged in (not on login page)
2. Check network tab to see if any API errors
3. Refresh the page
4. Clear browser cache

### Issue 2: Form Says "Add Product" But Nothing Happens

**Solutions:**
1. Check browser console (F12 → Console tab)
2. Verify API is running on `localhost:8089`
3. Check if you're authorized (logged in)
4. Look for error messages in red

### Issue 3: Questions/Products Not Showing

**Possible Reasons:**
1. No data in database yet
2. API endpoint not working
3. Authentication token expired
4. Check browser console for errors

### Issue 4: "Cannot Read Property" Error

**Solution:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for error messages
4. Make sure API endpoints are running

---

## Testing Checklist

### Phase 1: UI & Routing ✅
- [ ] Can access admin panel via button
- [ ] Can access admin panel via direct URL
- [ ] Dashboard loads
- [ ] Sidebar navigation works
- [ ] All tabs are clickable

### Phase 2: Questions (Working Now)
- [ ] Add question form visible
- [ ] Form validation works
- [ ] Can add a question
- [ ] Question appears in list
- [ ] Success message shows
- [ ] Can delete a question
- [ ] Delete confirmation works

### Phase 3: Products (Working Now)
- [ ] Add product form visible
- [ ] Can add a product
- [ ] Product appears in grid
- [ ] Can search products
- [ ] Can filter by category
- [ ] Stock level indicator shows correct color
- [ ] Can delete a product

### Phase 4: Orders (Partial)
- [ ] Orders table visible
- [ ] Stat cards show numbers
- [ ] Can filter by status
- [ ] View button shows modal ✅
- [ ] Status dropdown appears ⚠️ (needs API)
- [ ] Updating status saves ❌ (needs API)

### Phase 5: Exams (Pending)
- [ ] Page loads without errors ✅
- [ ] Shows "No test records found" message ✓
- [ ] Once API created: Shows test records ❌ (pending)
- [ ] Search works ❌ (pending)
- [ ] Filter works ❌ (pending)
- [ ] Sort works ❌ (pending)

---

## How to Test Without Backend

### Using Browser DevTools

1. **Open DevTools** (F12)
2. **Go to Network tab**
3. **Watch API calls** as you perform actions
4. **Check Response** to see if data comes back

### Check Console for Errors

1. **Open DevTools** (F12)
2. **Go to Console tab**
3. **Look for red error messages**
4. Example error: `"POST /api/orders/1/status 404 Not Found"`

### Simulate With Mock Data

In browser console, you can check what's being sent:
```javascript
// You'll see API calls like:
// POST /api/products
// GET /api/orders
// PUT /api/orders/1/status (will fail - needs creation)
```

---

## Backend Readiness Checklist

Before reporting issues, make sure:

- [ ] Backend API is running
- [ ] Database is running
- [ ] Tables exist: questions, products, orders, order_items
- [ ] Authentication is working
- [ ] CORS is configured (if different port)
- [ ] Token is being sent with requests

---

## Data for Testing

### Sample Question
```
Text: "What is the capital of India?"
A: "Mumbai"
B: "New Delhi" ← Correct
C: "Bangalore"
D: "Kolkata"
Branch: CSE
Difficulty: EASY
```

### Sample Product
```
Name: "DSA Textbook"
Description: "Complete Data Structures and Algorithms"
Price: 49.99
Stock: 25
Category: BOOKS
Branch: CSE
ImageUrl: (leave empty - uses default icon)
```

### Sample Order Data (When Viewing)
```
Order ID: #1
Student ID: 101
Items: 2 (Product#5 qty 2, Product#8 qty 1)
Total: $59.98
Date: March 30, 2026
Status: PENDING
```

---

## Expected API Behaviors

### When API Works ✅
- Form submission succeeds
- Success message appears (green box)
- Data updates in list immediately
- No console errors

### When API Missing ❌
- Form submits but nothing happens
- Error message appears (red box)
- Console shows 404 error
- "Cannot find endpoint" message

### When Authentication Fails ❌
- All API calls return 401 error
- Login/token issue
- Need to login again

---

## Next Steps

1. **Test Questions & Products Now** ✅ (they work)
2. **Note Errors in Orders Status Update** (needs API)
3. **Create Backend Endpoints** (see API_ENDPOINTS.md)
   - GET `/api/exams/student-records`
   - PUT `/api/orders/{id}/status`
4. **Once APIs Created:**
   - Restart backend
   - Refresh admin panel
   - All features will work!

---

## Getting Help

If something doesn't work:

1. **Check Console** (F12 → Console)
2. **Check Network Tab** (F12 → Network)
3. **Look at Error Message** (red boxes on UI)
4. **Check API Endpoints** (see API_ENDPOINTS.md)
5. **Verify Backend is Running** (localhost:8089)

---

**Happy Testing! 🚀**

Once you create the missing backend endpoints, the admin panel will be 100% functional!
