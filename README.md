# Expense Tracker

A full-stack Expense Tracker web application built using the MERN stack. The application allows users to securely manage their daily expenses through user authentication and CRUD operations.

## Features

- User Registration
- Secure Login with JWT Authentication
- Password Hashing using bcrypt
- Add Expenses
- View Expenses
- Update Expenses
- Delete Expenses
- User-specific Expense Management

## Tech Stack

### Frontend
- React.js
- HTML5
- CSS3

### Backend
- Node.js
- Express.js

### Database
- MongoDB

### Authentication
- JWT (JSON Web Token)
- bcrypt.js

## Project Structure

```
Expense-Tracker/
├── client/
├── server/
├── package.json
└── README.md
```

## Installation

### Clone the repository

```bash
git clone https://github.com/KarunyaKS/expense-tracker.git
```

### Backend

```bash
cd server
npm install
npm start
```

### Frontend

```bash
cd client
npm install
npm start
```

## Environment Variables

Create a `.env` file inside the server folder.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRE=30d
```

## Future Improvements

- Expense Categories
- Monthly Expense Reports
- Charts & Analytics
- Export Expenses
- Budget Tracking

## Author

**Karunya K S**

GitHub: https://github.com/KarunyaKS
