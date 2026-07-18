# MERN Expense Tracker — Complete Interview Guide

---

## HOW TO INTRODUCE YOUR PROJECT (say this first, in every interview)

> "I built a full-stack Expense Tracker using the MERN stack — MongoDB, Express, React, and Node.js.
> The app lets users register, log in securely, and manage their personal expenses with full CRUD operations.
> I implemented JWT-based authentication so each user only sees their own data.
> I used React Context API for global state management on the frontend, and Express middleware for protecting API routes on the backend."

That's your 30-second pitch. Memorize it. Say it confidently.

---

## PROJECT STRUCTURE (know this like your home address)

```
expense-tracker/
├── backend/
│   ├── server.js                  ← Entry point, starts Express + MongoDB
│   ├── .env                       ← Secret keys (never push to GitHub)
│   ├── models/
│   │   ├── User.js                ← User schema, password hashing
│   │   └── Expense.js             ← Expense schema, linked to User
│   ├── controllers/
│   │   ├── authController.js      ← register, login, getMe logic
│   │   └── expenseController.js   ← CRUD logic for expenses
│   ├── middleware/
│   │   └── authMiddleware.js      ← JWT verification (protect function)
│   └── routes/
│       ├── authRoutes.js          ← /api/auth/*
│       └── expenseRoutes.js       ← /api/expenses/*
│
└── frontend/
    ├── public/
    │   └── index.html             ← Single HTML file React mounts into
    └── src/
        ├── index.js               ← React entry point
        ├── App.js                 ← Router setup
        ├── context/
        │   └── AuthContext.js     ← Global auth state (user, token, login, logout)
        ├── components/
        │   ├── Navbar.js          ← Top nav with logout
        │   └── PrivateRoute.js    ← Redirects to /login if not authenticated
        └── pages/
            ├── LoginPage.js       ← Login form
            ├── RegisterPage.js    ← Register form
            └── DashboardPage.js   ← Full CRUD expense management
```

---

## COMPLETE REQUEST FLOW (draw this on a whiteboard if asked)

### Login Flow:
```
User types email+password
  → LoginPage calls AuthContext.login()
    → axios.post('/api/auth/login', { email, password })
      → Express routes to authController.login()
        → User.findOne({ email }).select('+password')
          → bcrypt.compare(enteredPassword, hashedPassword)
            → jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' })
              → res.json({ token, user })
                → AuthContext saves token to localStorage + React state
                  → axios default header set: "Authorization: Bearer <token>"
                    → navigate('/') → DashboardPage renders
```

### Protected API Call Flow:
```
DashboardPage mounts
  → axios.get('/api/expenses')  [token auto-attached in header]
    → Express → expenseRoutes
      → protect middleware runs first:
          reads header → jwt.verify(token, JWT_SECRET)
          → User.findById(decoded.id).select('-password')
          → req.user = user → next()
        → getExpenses controller runs:
            Expense.find({ user: req.user._id }).sort({ date: -1 })
              → res.json(expenses)
                → setExpenses(res.data) → React re-renders list
```

---

## INTERVIEW QUESTIONS AND EXACT ANSWERS

### SECTION 1: PROJECT OVERVIEW

**Q: Tell me about your project.**
A: "I built a MERN stack Expense Tracker. Users can register and log in with JWT authentication.
Once logged in, they can add, view, edit and delete their personal expenses.
Each expense has a title, amount, category, date, and description.
The backend is Express with MongoDB, frontend is React with Context API for state management."

**Q: Why did you choose the MERN stack?**
A: "MongoDB is flexible with JSON-like documents which fits well for expense data.
Express is lightweight and easy to build REST APIs with.
React is great for building interactive UIs — the component model makes the code reusable.
Node.js lets us use JavaScript on both frontend and backend, so there's no context switching.
Also, MERN is widely used and has great community support, which helped me when I got stuck."

**Q: What are the main features of your project?**
A: "User registration and login with JWT authentication.
Full CRUD for expenses — create, read, update, delete.
Each user only sees their own expenses — data isolation using the user's ID.
Category-wise organization — Food, Transport, Bills etc.
Total spending calculated on the frontend without an extra API call.
Protected routes on both frontend and backend."

---

### SECTION 2: BACKEND QUESTIONS

**Q: What is REST API? Is your project RESTful?**
A: "REST stands for Representational State Transfer. It's a set of rules for designing APIs.
In REST, each URL represents a resource and HTTP methods define what to do with it.
My project follows REST:
- GET /api/expenses → fetch all expenses
- POST /api/expenses → create new expense
- PUT /api/expenses/:id → update specific expense
- DELETE /api/expenses/:id → delete specific expense
Each request is stateless — the server doesn't remember previous requests.
The JWT in each request header gives the server all the context it needs."

**Q: What is middleware in Express? Give an example from your project.**
A: "Middleware is a function that runs between the HTTP request arriving and the route handler executing.
It receives req, res, and next as parameters.
If it calls next(), the request moves to the next middleware or controller.
If it sends a response, the request stops there.
In my project, I have a protect middleware that:
1. Reads the Authorization header
2. Extracts the JWT token
3. Verifies it using jwt.verify()
4. Fetches the user from the database
5. Attaches user to req.user
6. Calls next() so the controller can run
If the token is missing or invalid, it returns a 401 Unauthorized response immediately."

**Q: What is JWT? How does it work in your project?**
A: "JWT stands for JSON Web Token. It's a way to securely transmit information between parties.
A JWT has three parts separated by dots: header.payload.signature
- Header: algorithm type (HS256)
- Payload: data stored in the token — in my case, the user's MongoDB ID
- Signature: created using the secret key, proves the token wasn't tampered with

When a user logs in, I create a JWT with jwt.sign() containing their user ID.
I send it back to the frontend. The frontend stores it in localStorage and attaches it
to every request in the Authorization header as 'Bearer <token>'.
On the backend, the protect middleware calls jwt.verify() which checks the signature
and expiry. If valid, it decodes the payload to get the user ID and fetches the user.
This way, the server knows WHO is making every request without storing sessions."

**Q: Why use JWT instead of sessions?**
A: "Sessions store user data on the server — every request requires a DB or memory lookup.
JWT is stateless — the token itself contains the user ID. The server just verifies the signature.
This is simpler to implement and scales better.
For a project like this, JWT is the right choice.
The tradeoff is that JWTs can't be invalidated before they expire — but for a learning project,
the 30-day expiry is acceptable."

**Q: What is bcrypt? Why not just use MD5 or SHA256 to hash passwords?**
A: "bcrypt is a password hashing algorithm designed specifically for passwords.
MD5 and SHA256 are fast — which is bad for passwords because attackers can try
billions of combinations per second using GPUs.
bcrypt is intentionally slow due to its 'cost factor' (I use 10 rounds).
It also automatically adds a random 'salt' to each hash, which means
two users with the same password get completely different hashes.
This defeats rainbow table attacks where attackers pre-compute hashes.
In my project, the User model has a pre-save hook that automatically hashes
the password before saving to MongoDB. For login, I use bcrypt.compare()
which hashes the input and compares it to the stored hash."

**Q: What is a pre-save hook in Mongoose?**
A: "A pre-save hook is a function that runs automatically BEFORE a document is saved to MongoDB.
In my User model, I have:
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
The isModified check is important — if a user updates their name, we don't want to
re-hash an already-hashed password. So we only hash when the password field actually changed."

**Q: What is the difference between findById and findOne in Mongoose?**
A: "findById(id) is a shorthand for findOne({ _id: id }).
In my project I use both.
For auth middleware: User.findById(decoded.id) — I already have the exact ID from the JWT.
For delete/update: Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id })
Here I use findOne with two conditions because I'm doing an ownership check —
I want to find an expense that matches BOTH the ID AND the user.
This prevents one user from deleting another user's expense."

**Q: What does .select('-password') mean?**
A: "In my User schema, I set select: false on the password field.
This means User.find() or User.findById() will NOT return the password by default.
In auth middleware I use .select('-password') explicitly to be safe.
In the login controller, I use .select('+password') because I need the password
to compare it with what the user entered.
The + means 'include this even though it's set to false by default'."

**Q: What is CORS and why do you need it?**
A: "CORS stands for Cross-Origin Resource Sharing.
Browsers block requests from one origin (localhost:3000) to a different origin (localhost:5000)
by default — this is a browser security feature.
I installed the cors npm package and added app.use(cors()) in server.js.
This tells the browser: 'yes, requests from other origins are allowed.'
In production, you'd configure cors to only allow your specific frontend domain."

---

### SECTION 3: FRONTEND QUESTIONS

**Q: What is React Context API? Why did you use it?**
A: "Context API is React's built-in way to share state across the component tree
without passing props through every level (called prop drilling).
I used it for authentication state — the user object, token, and auth functions
like login, logout, register need to be accessible from multiple components:
Navbar needs user.name to show 'Hi, Karunya', PrivateRoute needs user to check if logged in,
LoginPage needs the login function.
Without Context, I'd have to pass these as props through App → every component.
With Context, any component calls useAuth() and gets direct access."

**Q: What is the difference between useState and useEffect?**
A: "useState is for storing and updating data in a component.
When state changes, React re-renders the component with the new value.
In my DashboardPage: useState([]) holds the expenses array, useState(false) holds showForm.

useEffect is for running side effects — things that happen outside of rendering,
like API calls, localStorage access, or event listeners.
useEffect(() => { fetchExpenses(); }, []) — the empty array [] means this runs
once when the component first mounts, not on every re-render.
In my AuthContext, useEffect checks localStorage on app load to restore the logged-in user."

**Q: What is a controlled component in React?**
A: "A controlled component is a form element whose value is controlled by React state.
The input's value comes from state, and every keystroke calls onChange which updates state.
In my LoginPage:
<input value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
React is always the 'single source of truth' for the input's value.
Contrast with uncontrolled components where the DOM manages the value and you use useRef to read it.
I prefer controlled because it makes validation easier — I can check formData anytime."

**Q: What is PrivateRoute? How does it work?**
A: "PrivateRoute is a wrapper component I created to protect frontend pages.
It reads the user from AuthContext.
If user exists (logged in) → it renders the children (the protected page).
If user is null (not logged in) → it renders <Navigate to='/login' replace />
which immediately redirects to the login page.
In App.js I wrap the dashboard: <PrivateRoute><DashboardPage /></PrivateRoute>
This is frontend-only protection. The backend has its own protect middleware as the real security layer."

**Q: Why did you use axios instead of fetch?**
A: "Axios is an HTTP client library with some advantages over the built-in fetch:
1. Default headers — I set axios.defaults.headers.common['Authorization'] once after login.
Every subsequent request automatically includes the JWT. With fetch, I'd have to add the header manually each time.
2. Automatic JSON parsing — axios.get() gives me res.data directly.
With fetch I'd need to do response.json() separately.
3. Error handling — axios throws errors for 4xx/5xx responses.
fetch only throws for network errors, so I'd have to check response.ok manually.
For a project this size, either would work, but axios made the JWT header management cleaner."

**Q: What is localStorage? How did you use it?**
A: "localStorage is a browser API that stores key-value pairs persistently — the data
survives page refreshes and browser restarts.
I use it to store the JWT token and user object after login.
When the app loads, AuthContext's useEffect checks localStorage for a saved token.
If found, it restores the auth state so the user stays logged in.
On logout, I remove the token from localStorage using localStorage.removeItem('token').
The security limitation is that localStorage is accessible by JavaScript,
making it vulnerable to XSS attacks. For production, httpOnly cookies are more secure.
But for a learning project, localStorage is the standard approach."

---

### SECTION 4: DATABASE QUESTIONS

**Q: Why MongoDB for this project? Why not MySQL?**
A: "MongoDB stores data as JSON-like documents, which fits naturally with JavaScript and Node.js.
There's no need to convert between objects and table rows.
For expense data, the schema is fairly simple and consistent, so either would work.
MongoDB is schema-flexible — I could add fields to expenses later without migrations.
Also, in the MERN stack, MongoDB is the standard choice and integrates seamlessly with Mongoose.
If I needed complex relationships or transactions, SQL would be better.
For this project, MongoDB was the right fit."

**Q: What is Mongoose? Why use it instead of the MongoDB native driver?**
A: "Mongoose is an ODM — Object Document Mapper — for MongoDB.
It lets you define schemas (structure and validation rules for documents)
and gives you a simpler API for database operations.
Without Mongoose I'd use the native MongoDB driver which has more verbose syntax
and no built-in schema validation.
Mongoose gives me:
- Schema definition with types and validation
- Pre-save hooks for password hashing
- Methods like findByIdAndUpdate, findOneAndDelete
- Automatic _id creation
- ref for relationships between collections (User and Expense)
For a Node.js project, Mongoose is the standard choice."

**Q: Explain your database schema.**
A: "I have two collections — users and expenses.

User schema:
- name: String, required
- email: String, required, unique, lowercase
- password: String, required, minlength 6, select:false (hidden by default)
- timestamps: createdAt, updatedAt (auto-managed by Mongoose)

Expense schema:
- title: String, required
- amount: Number, required
- category: String, default 'Other'
- date: Date, default now
- description: String, optional
- user: ObjectId, ref: 'User' — this is the foreign key linking each expense to its owner
- timestamps: auto

The user field in Expense is the key relationship. When I query expenses,
I filter by { user: req.user._id } so each user only gets their own expenses."

---

### SECTION 5: SECURITY QUESTIONS

**Q: What security measures have you implemented?**
A: "Several:
1. Password hashing — passwords are hashed with bcrypt before storing. Never stored as plain text.
2. JWT authentication — every protected API call requires a valid signed token.
3. Ownership verification — when updating or deleting, I check that the expense belongs to the logged-in user using { _id: id, user: req.user._id } in the query.
4. Environment variables — JWT secret and MongoDB URI are in .env, not hardcoded.
5. Token expiry — JWTs expire in 30 days, so old tokens become invalid.
6. Generic error messages — on login failure, I say 'Invalid credentials' instead of 'Email not found' to avoid revealing which field is wrong."

**Q: What is the difference between authentication and authorization?**
A: "Authentication is verifying who you are — 'prove you are who you claim.'
My login system does this: checks email exists, verifies password with bcrypt, issues a token.

Authorization is verifying what you're allowed to do — 'you're logged in, but can you do THIS?'
My ownership check in update/delete is a form of authorization:
even if you're authenticated, you can only modify YOUR OWN expenses.
The protect middleware handles authentication.
The { _id: id, user: req.user._id } query condition handles authorization."

---

### SECTION 6: QUESTIONS THEY WILL DEFINITELY ASK (be very ready)

**Q: What was the most challenging part of your project?**
A: "The most challenging part was understanding the JWT flow end-to-end.
At first I couldn't figure out why axios wasn't sending the token with requests.
I had to debug and realize I needed to set axios.defaults.headers.common after login.
Also understanding the pre-save hook in Mongoose — why the isModified check is necessary —
took some time to fully grasp. Once I understood it, everything clicked."

**Q: What would you improve if you had more time?**
A: "A few things:
1. Add input validation on the backend using a library like express-validator — right now I only have basic checks.
2. Add a monthly budget feature — let users set a monthly limit and show when they're close to it.
3. Add a simple bar chart showing spending by category using a chart library.
4. Better error handling — more specific error messages.
5. Deploy it — the frontend on Netlify and backend on Render.
I kept scope realistic for the timeline, but these would be natural next steps."

**Q: Have you tested your API?**
A: "Yes, I tested all API endpoints using Postman.
I tested the register and login endpoints first, copied the returned JWT,
then used it as a Bearer token in the Authorization header to test the protected routes.
I specifically tested edge cases like:
- trying to access /api/expenses without a token (should get 401)
- trying to register with an already-used email (should get 400)
- trying to delete an expense with a wrong ID (should get 404)"

**Q: What is the difference between PUT and PATCH?**
A: "PUT replaces the entire resource with the new data you send.
PATCH partially updates a resource — only the fields you send get changed.
In my project I use PUT for updating expenses.
Technically since I send the whole form on edit, PUT is correct.
PATCH would be more appropriate if I wanted to update just one field, like only the amount.
For simplicity in this project, PUT works fine."

**Q: Explain async/await in your project.**
A: "JavaScript is single-threaded. Database operations and API calls take time.
Without async/await, I'd use callbacks or Promises with .then/.catch, which gets messy.
async/await is syntactic sugar over Promises that makes asynchronous code look synchronous.
In my controllers:
const expenses = await Expense.find({ user: req.user._id });
await pauses execution until the DB query completes, then assigns the result.
I wrap everything in try/catch — if the await throws (DB error, etc), catch handles it.
Every controller function is marked async because it contains await calls."

---

## CONCEPTS YOU MUST STUDY (with simple explanations)

### 1. How HTTP works
- Client sends a request (method + URL + headers + body)
- Server processes it and sends a response (status code + body)
- Status codes: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Server Error

### 2. REST principles
- Stateless: each request has everything needed, server stores nothing about previous requests
- Resources: URL identifies a resource (/expenses), method identifies action (GET/POST/PUT/DELETE)

### 3. MVC-ish pattern
- Model: Mongoose schema (User.js, Expense.js) — defines data structure
- Controller: business logic (authController.js, expenseController.js) — handles requests
- Route: URL mapping (authRoutes.js, expenseRoutes.js) — connects URL to controller
- View: React components — what the user sees

### 4. JWT structure
- eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9  ← header (base64)
- .eyJpZCI6IjY0YWJjLi4uIn0                ← payload (base64) — contains { id: userId }
- .SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV     ← signature (HMAC-SHA256 of header+payload using secret)

### 5. React component lifecycle (simple version)
- Component mounts → useEffect([]) runs → API call
- State changes → component re-renders → UI updates
- Component unmounts → cleanup (if any)

### 6. What happens on page refresh
- React state is lost
- AuthContext's useEffect reads localStorage
- Finds token → sets axios header → restores auth state → user stays logged in
- No token → user sees login page

### 7. MongoDB ObjectId
- Every document gets an _id automatically — a 12-byte unique identifier
- Looks like: 64abc1234567890def123456
- When Expense stores user: ObjectId, it stores the User's _id
- This is like a foreign key in SQL

---

## THINGS TO NEVER SAY IN AN INTERVIEW

❌ "I just copied it from YouTube / GitHub"
✅ "I built it by following documentation and debugging issues myself"

❌ "I don't know how JWT works exactly"
✅ Explain the three parts: header, payload, signature — you know this now

❌ "I don't know why I used MongoDB"
✅ "MongoDB is document-based, fits naturally with JavaScript's JSON objects"

❌ "I haven't tested the API"
✅ "I tested all endpoints using Postman"

❌ Making up features that aren't there
✅ Be honest about what's built, explain what you'd add next

---

## QUICK REVISION CHECKLIST (read before every interview)

- [ ] Can explain the full login flow in 60 seconds
- [ ] Know what JWT stands for and its 3 parts
- [ ] Can explain bcrypt and why not MD5
- [ ] Can explain what middleware does and give an example
- [ ] Know the difference between authentication vs authorization
- [ ] Can explain React Context API and why you used it
- [ ] Know what useEffect([]) does
- [ ] Can explain the project structure folder by folder
- [ ] Know all HTTP methods used and what each does
- [ ] Can explain what the user field in Expense does
