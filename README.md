# Savoy Hotel Management System

A comprehensive full-stack hotel booking and management website built with React, Node.js, Express, and MySQL. This system allows guests to browse rooms, check real-time availability, manage a booking reservation cart, and securely check out. It also includes an administrative dashboard for managing hotel inventory and bookings.

> [!NOTE]
> For a deep-dive into the database schema, Express endpoints, scheduled tasks, React state managers, and setup troubleshooting, view the complete **[Technical Documentation](DOCUMENTATION.md)**.

## 🌟 Features

### For Guests

- **Browse & Filter Rooms:** Explore available rooms with detailed descriptions, images, and pricing.
- **Real-Time Availability:** Check room availability for specific dates.
- **Booking & Cart System:** Add rooms to a cart and check out seamlessly using Stripe for payments.
- **Authentication:** Secure user sign-up and sign-in with JWT.
- **Reviews:** Guests can leave ratings and reviews for their stays.

### For Administrators

- **Inventory Dashboard:** Manage room inventory (add, edit, or remove rooms).
- **Booking Management:** Monitor and oversee user reservations.

## 💻 Tech Stack

- **Frontend:** React.js, Context API (AuthContext, CartContext), standard CSS.
- **Backend:** Node.js, Express.js.
- **Database:** MySQL with Sequelize ORM.
- **Security & Auth:** JSON Web Tokens (JWT), bcryptjs for password hashing, Helmet for HTTP header security.
- **Payments:** Stripe integration for processing bookings.

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- [Node.js](https://nodejs.org/)
- [MySQL](https://www.mysql.com/) database server running locally.

### 1. Clone the repository

```bash
git clone <your-github-repo-url>
cd Hotel-website
```

### 2. Backend Setup

Navigate to the backend directory, install dependencies, and configure your environment:

```bash
cd backend
npm install
```

Initialize the database, run migrations, and seed initial data:

```bash
# Create the database using Sequelize CLI
npx sequelize-cli db:create --config config/config.js

# Run migrations to build the tables
npm run migrate

# Seed the database with initial dummy data
npm run seed

# Start the backend server
npm run dev
```

_The backend server will run on `http://localhost:5000`._

### 3. Frontend Setup

Open a new terminal window, navigate to the frontend directory, and start the React application:

```bash
cd frontend
npm install

# Start the React development server
npm start
```

_The frontend application will compile and open in your browser typically on `http://localhost:3000`._

## 📂 Project Structure

```text
Hotel-website/
├── backend/                  # Node.js, Express API server
│   ├── config/               # Database and environment configurations
│   ├── controllers/          # Route logic handlers (users, rooms, bookings)
│   ├── migrations/           # Sequelize schema instructions
│   ├── models/               # Sequelize ORM models definitions
│   ├── routes/               # API route endpoints
│   ├── seeders/              # Initial database mock data
│   └── server.js             # Main backend entry point
└── frontend/                 # React client application
    ├── public/               # Static assets
    └── src/
        ├── components/       # Reusable UI components (Header, Footer, BookingForm)
        ├── context/          # React Contexts (AuthContext, CartContext)
        ├── pages/            # Full-page components (Home, Reservation, Checkout)
        └── utils/            # General API and utility functions
```

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## 📝 License

This project is licensed under the MIT License.
