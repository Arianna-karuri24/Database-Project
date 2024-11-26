#Express Tracking App

This is a simple Node.js API for managing expenses. It allows users to register, log in, and track their expenses. The backend uses Express.js, and the data is stored in a MySQL database.

## Features

- **User Registration**: Allows new users to sign up with their email, username, and password.
- **User Login**: Allows users to log in and get authenticated.
- **Add Expense**: Allows logged-in users to add an expense with amount, category, and date.
- **View Expenses**: View all expenses associated with the logged-in user.
- **Logout**: Logs the user out and ends the session.

## Setup

### Prerequisites

- **Node.js** (v20.17.0)
- **MySQL** (v5.7)

### Installation

1. Clone the repository to your local machine:
    ```bash
    git clone https://github.com/Arianna-karuri24/expense-tracker.git
    ```

2. Navigate into your project directory:
    ```bash
    cd expense-tracker
    ```

3. Install project dependencies:
    ```bash
    npm install
    ```

4. Create a `.env` file in the root directory and add your database credentials:
    ```env
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=ariannasql10424
    DB_NAME=expense_tracker
    SECRET_KEY=ari24xx
    ```

5. Start the server:
    ```bash
    node server.js
    ```

6. My server will be running on `http://localhost:5001`.

---

### API Endpoints

#### User Routes

- **POST** `/api/user/register`: Register a new user. Body:
    ```json
    {
      "email": "realarianna@gmail.com",
      "username": "arixplorer",
      "password": "24Arix"
    }
    ```

- **POST** `/api/user/login`: Log in an existing user. Body:
    ```json
    {
      "username": "arixplorer",
      "password": "24Arix"
    }
    ```

- **POST** `/api/user/logout`: Log out the current user.

- **GET** `/api/user/session`: Check if the user is logged in.

#### Expense Routes

- **POST** `/api/expense/add`: Add an expense. Body:
    ```json
    {
      "amount": 50.00,
      "date": "2024-11-26",
      "category": "Food",
      "description": "Lunch"
    }
    ```

- **GET** `/api/expense/view`: View all expenses for the logged-in user.

---

## Dependencies

- `express`: Web framework for Node.js.
- `mysql2`: MySQL database client for Node.js.
- `bcrypt`: Password hashing library.
- `express-session`: Session management for storing user sessions.
- `dotenv`: Loads environment variables from a `.env` file.
- `cors`: Middleware to enable Cross-Origin Resource Sharing.

---

## License

This project is licensed under the MIT License.
