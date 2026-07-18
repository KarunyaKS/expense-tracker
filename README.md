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
Screenshots

Login Page 
<img width="521" height="666" alt="Screenshot 2026-07-18 135220" src="https://github.com/user-attachments/assets/77f61258-92ba-44c2-bde2-747e08ac289a" />

Dashboard
<img width="1912" height="712" alt="Screenshot 2026-07-18 135251" src="https://github.com/user-attachments/assets/040b376d-b7ac-485a-8236-d2986749c2be" />

<img width="1890" height="763" alt="Screenshot 2026-07-18 135403" src="https://github.com/user-attachments/assets/ce628151-0604-43b3-b058-f92f61f3c4cf" />

<img width="1903" height="732" alt="Screenshot 2026-07-18 135432" src="https://github.com/user-attachments/assets/1e96f067-4a52-41fa-b978-670761fffadd" />


## Future Improvements

- Expense Categories
- Monthly Expense Reports
- Charts & Analytics
- Export Expenses
- Budget Tracking

## Author

**Karunya K S**

GitHub: https://github.com/KarunyaKS
