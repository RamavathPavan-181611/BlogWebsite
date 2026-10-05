# Project Issues Analysis - Full Stack Blog Platform

## Critical Issues (Must Fix Before Running)

### 1. **Missing `.env` File**

**Severity:** 🔴 CRITICAL

- **Location:** Root directory
- **Issue:** The `.env` file is missing. Only `.env.example` exists
- **Impact:** Application cannot start without environment variables
- **Solution:** Copy `.env.example` to `.env` before running

```bash
cp .env.example .env
```

### 2. **MongoDB Must Be Running**

**Severity:** 🔴 CRITICAL

- **Location:** Backend database connection
- **Issue:** The app expects MongoDB to be running on `localhost:27017`
- **Impact:** Backend will fail to connect to database if MongoDB service isn't running
- **Solution:** Start MongoDB service before running the app

```bash
# macOS with Homebrew
brew services start mongodb-community

# Or manually
mongod
```

### 3. **Missing Dependencies Installation**

**Severity:** 🔴 CRITICAL

- **Location:** All npm packages
- **Issue:** Running `npm install` is required in root, backend, and frontend directories
- **Impact:** Cannot start the application without installed packages
- **Solution:**

```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

---

## High Priority Issues

### 4. **Route Ordering Issue in `postRoutes.js`**

**Severity:** 🟠 HIGH

- **Location:** `backend/routes/postRoutes.js`
- **Issue:** Route `/my-posts` is defined AFTER `/:id`. Express will match "my-posts" as an ID
- **Current Order:**
  ```javascript
  router.get('/', getAllPosts);
  router.get('/my-posts', getMyPosts); // ❌ WRONG POSITION
  router.get('/:id', getPostById); // This matches first
  ```
- **Impact:** `/my-posts` endpoint will never work; it will try to fetch "my-posts" as an ID
- **Solution:** Move `/my-posts` before `/:id`:
  ```javascript
  router.get('/', getAllPosts);
  router.get('/my-posts', getMyPosts); // ✅ CORRECT
  router.get('/:id', getPostById);
  ```

### 5. **Incomplete `deletePost` Controller**

**Severity:** 🟠 HIGH

- **Location:** `backend/controllers/postController.js` (line ~150+)
- **Issue:** The `deletePost` function is truncated and missing the completion
- **Impact:** Deleting posts will cause server error
- **Current Code Ends At:**
  ```javascript
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid post ID' });
  }
  // INCOMPLETE - FILE CUT OFF HERE
  ```
- **Solution:** Complete the function:

  ```javascript
  export const deletePost = async (req, res) => {
    try {
      const userId = req.headers['x-user-id'];
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid post ID' });
      }

      const post = await Post.findById(id);

      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      if (post.author.toString() !== userId) {
        return res
          .status(403)
          .json({ message: 'Not authorized to delete this post' });
      }

      await Post.findByIdAndDelete(id);

      res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
      console.error('Delete post error:', error);
      res.status(500).json({ message: 'Server error deleting post' });
    }
  };
  ```

---

## Security Issues

### 6. **Passwords Stored in Plain Text**

**Severity:** 🔴 CRITICAL

- **Location:** `backend/models/User.js` and `backend/controllers/authController.js`
- **Issue:** Passwords are stored and compared directly without hashing
- **Impact:** Any database breach exposes all user passwords
- **Current Code:**
  ```javascript
  if (user.password !== password) {
    // ❌ Plain text comparison
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  ```
- **Solution:** Install and use bcrypt:
  ```bash
  npm --prefix backend install bcrypt
  ```
  Then hash passwords on save and compare on login

### 7. **Weak Authentication System**

**Severity:** 🔴 CRITICAL

- **Location:** `backend/controllers/authController.js` and `backend/routes/postRoutes.js`
- **Issue:** User ID passed in headers (`x-user-id`) can be easily spoofed
- **Current Code:**
  ```javascript
  const userId = req.headers['x-user-id']; // ❌ Easy to spoof
  ```
- **Impact:** Any user can perform actions as any other user
- **Solution:** Implement JWT (JSON Web Tokens) or session-based authentication instead

### 8. **CORS Configuration**

**Severity:** 🟠 HIGH

- **Location:** `backend/app.js`
- **Issue:** CORS allows all origins (`cors()` without options)
- **Current Code:**
  ```javascript
  app.use(cors()); // ❌ Allows all origins
  ```
- **Impact:** Any website can make requests to your API
- **Solution:** Restrict to specific origins:
  ```javascript
  app.use(
    cors({
      origin: ['http://localhost:8000', 'http://localhost:3000'],
      credentials: true
    })
  );
  ```

### 9. **No Input Validation/Sanitization**

**Severity:** 🟠 HIGH

- **Location:** Throughout `postController.js` and `authController.js`
- **Issue:** User inputs are not validated or sanitized before database operations
- **Impact:** Vulnerable to NoSQL injection attacks
- **Solution:** Use a validation library like `joi` or `validator`

---

## Configuration Issues

### 10. **Frontend Port Hardcoded in Base URL**

**Severity:** 🟠 HIGH

- **Location:** `frontend/src/utils/baseURL.js`
- **Issue:** Assumes backend is on port 8080, hardcoded replacement
- **Current Code:**
  ```javascript
  const baseURL = `${currentProtocol}//${currentHost.replace('8000', '8080')}`;
  ```
- **Impact:** Cannot easily change backend port without code modification
- **Solution:** Use environment variables:
  ```javascript
  const baseURL =
    process.env.REACT_APP_API_URL ||
    `${currentProtocol}//${currentHost.replace('8000', '8080')}`;
  ```

### 11. **Missing Environment Variable in Backend Startup**

**Severity:** 🟠 HIGH

- **Location:** `backend/app.js`
- **Issue:** `NODE_ENV` is not being explicitly set in most startup scenarios
- **Current Code:**
  ```javascript
  if (process.env.NODE_ENV !== 'test') {
    const port = process.env.PORT || 8080;
  ```
- **Impact:** Development and production environments could run same way
- **Solution:** Set NODE_ENV=development in root `.env` file

---

## Frontend Issues

### 12. **Missing or Undefined CSS Classes**

**Severity:** 🟠 HIGH

- **Location:** `frontend/src/pages/LoginPage.js`, `CreatePostPage.js`, etc.
- **Issue:** CSS classes like `input-field`, `btn-primary`, `card`, `gray-custom` are used but may not be defined
- **Example:**
  ```javascript
  className = 'input-field';
  className = 'btn-primary w-full';
  className = 'gray-custom border border-gray-800';
  ```
- **Impact:** Styling won't work correctly
- **Solution:** Verify all custom classes are defined in `App.css` or Tailwind config

### 13. **Missing `AuthProvider` Wrapper Check**

**Severity:** 🟡 MEDIUM

- **Location:** `frontend/src/index.js`
- **Issue:** AuthProvider correctly wraps the app, but if anyone calls useAuth outside this wrapper, it will crash
- **Impact:** Runtime error if context is used incorrectly
- **Solution:** Already has error handling - verify it stays in place

---

## Data Issues

### 14. **Seed Script May Fail If Database Not Running**

**Severity:** 🟠 HIGH

- **Location:** `backend/utils/seed.js`
- **Issue:** No error handling if MongoDB connection fails
- **Impact:** Seeds fail silently without clear error message
- **Solution:** Already has error handling, but verify MongoDB is running first

### 15. **Test Database Hardcoded**

**Severity:** 🟡 MEDIUM

- **Location:** `backend/package.json` test script
- **Issue:** Test database name hardcoded as `BlogPlatform_test`
- **Current:**
  ```
  MONGODB_URI='mongodb://127.0.0.1:27017/BlogPlatform_test?...'
  ```
- **Impact:** Cannot change test database without modifying package.json
- **Solution:** Move to environment variable or config file

---

## Minor Issues

### 16. **No Logging/Error Tracking**

**Severity:** 🟡 MEDIUM

- **Location:** Throughout backend
- **Issue:** Only basic console.error logging
- **Impact:** Difficult to debug production issues
- **Solution:** Implement proper logging (Winston, Pino, etc.)

### 17. **No Database Indexes**

**Severity:** 🟡 MEDIUM

- **Location:** `backend/models/User.js` and `Post.js`
- **Issue:** No indexes defined for frequently queried fields
- **Impact:** Slow queries as database grows
- **Solution:** Add indexes for email (User), author (Post), category (Post)

### 18. **Email Uniqueness - Case Sensitivity**

**Severity:** 🟡 MEDIUM

- **Location:** `backend/models/User.js`
- **Issue:** Email field is lowercase but users could register with different cases
- **Current:**
  ```javascript
  email: {
    lowercase: true,  // ✓ Good
    unique: true      // ✓ Good, but needs unique compound index
  }
  ```

```
- **Solution:** Already handled correctly with lowercase

### 19. **No Rate Limiting**
**Severity:** 🟡 MEDIUM
- **Location:** Backend routes
- **Issue:** No rate limiting on login or API endpoints
- **Impact:** Vulnerable to brute force attacks
- **Solution:** Add express-rate-limit middleware

### 20. **Missing Cleanup on Frontend/Backend Disconnect**
**Severity:** 🟡 MEDIUM
- **Location:** Frontend API calls
- **Issue:** No timeout or reconnection strategy for failed backend connections
- **Impact:** Frontend hangs if backend is unavailable
- **Solution:** Add fetch timeout configuration

---

## Setup Issues

### 21. **Setup Script May Fail on Non-macOS Systems**
**Severity:** 🟡 MEDIUM
- **Location:** `setup.sh`
- **Issue:** MongoDB config path `/etc/mongod.conf` is hardcoded (Linux only)
- **Impact:** Script fails on macOS or Windows
- **Solution:** Use platform-detection in bash script

### 22. **No .env.backend File**
**Severity:** 🟡 MEDIUM
- **Location:** `backend/.env.example`
- **Issue:** Backend has separate .env.example but root-level setup uses root .env
- **Impact:** Confusion about which .env file to use
- **Solution:** Document clearly which file to copy for each workflow

---

## Before You Run This Project - Checklist

✅ **Required Steps:**
- [ ] Copy `.env.example` to `.env`
- [ ] Ensure MongoDB is installed and running
- [ ] Run `npm install` in root directory
- [ ] Run `npm install` in `backend` directory
- [ ] Run `npm install` in `frontend` directory
- [ ] Run `npm run seed` to populate database (optional but recommended)

✅ **Critical Fixes Needed:**
- [ ] Fix route ordering in `postRoutes.js` (move `/my-posts` before `/:id`)
- [ ] Complete the `deletePost` controller function
- [ ] Implement password hashing (bcrypt)
- [ ] Replace custom header-based auth with JWT tokens
- [ ] Verify all CSS classes are defined

✅ **Expected Ports:**
- Frontend: `http://localhost:8000`
- Backend: `http://localhost:8080`
- MongoDB: `localhost:27017`

✅ **Test Credentials (after seed):**
- Email: john@example.com | Password: password123
- Email: sarah@example.com | Password: password123
- Email: mike@example.com | Password: password123
- Email: emma@example.com | Password: password123

---

## Recommended Improvements

1. **Add TypeScript** for better type safety
2. **Add API documentation** (Swagger/OpenAPI)
3. **Add input validation** (joi or yup)
4. **Add password hashing** (bcrypt)
5. **Add JWT authentication** (jsonwebtoken)
6. **Add rate limiting** (express-rate-limit)
7. **Add database migrations** (mongoose migrations)
8. **Add E2E testing** (Cypress or Playwright)
9. **Add CI/CD pipeline** (GitHub Actions)
10. **Add Docker support** for easy deployment
```

