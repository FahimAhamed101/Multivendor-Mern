# Sleeknit Backend

Welcome to the backend infrastructure for the **Sleeknit** application. This repository contains the server-side code powering the Sleeknit platform, built with Node.js, Express, TypeScript, and MongoDB.

## Table of Contents
- [Project Overview](#project-overview)
- [Project Intention](#project-intention)
- [Project Models & Relations](#project-models--relations)
- [File Structure](#file-structure)
- [Installation Guide](#installation-guide)

## Project Overview

The Sleeknit Backend serves as a comprehensive e-commerce and service platform API. It is designed to handle a wide range of features necessary for a multi-tenant marketplace or service platform. The system supports distinct roles including customers, vendors, and admins. 

Key features include:
- **User Authentication & Management:** Standard JWT and Google OAuth authentication for roles (Admin, Vendor, User).
- **Product Catalog & Showroom:** Vendors can create products, manage stocks, link them to specific showrooms, and apply discounts.
- **Orders & Custom Orders:** Robust handling of standard and customized product orders.
- **Delivery Requests:** Managing the logistics and tracking of orders.
- **Payments:** Stripe integration for secure transaction processing.
- **Real-time Chat & Notifications:** Socket.io powered communication between customers, vendors, and support.
- **Reviews & Ratings:** System for product and vendor feedback.

## Project Intention

The core intention of this project is to provide a highly scalable, secure, and modular backend system for the Sleeknit ecosystem. The architecture is intentionally decoupled into distinct domains (modules) to promote separation of concerns, easier maintenance, and scalability as the application grows. The use of TypeScript provides strong typing to minimize runtime errors, while MongoDB allows flexible and dynamic data modeling fitting for complex e-commerce structures.

## Project Models & Relations

The data architecture is centered around several key interconnected models:

- **User Model (`User`)**: The central entity representing all platform actors (Customers, Vendors, Admins).
- **Product Model (`Product`)**: Represents items for sale.
  - *Relations:* Connected to a `User` (as the Vendor) and a `Showroom`. Can also optionally link to a `CustomOrder` if the product is personalized. 
- **Showroom Model (`Showroom`)**: Physical or virtual storefronts managed by Vendors.
  - *Relations:* Owned by a Vendor (`User`). Products are categorized and displayed within Showrooms.
- **Order Model (`Order` & `CustomOrder`)**: Handles purchasing transactions.
  - *Relations:* Links a Customer (`User`) to multiple `Product` items and specifies delivery/tracking details.
- **SaveProduct Model (`SaveProduct`)**: Manages User's Cart and Wishlist.
  - *Relations:* Links a `User` to a specific `Product`.
- **Review Model (`Review`)**: Stores feedback.
  - *Relations:* Links a Customer (`User`) to a `Product`.
- **Chat/Message Models (`Chat`, `Message`)**: Facilitates communication.
  - *Relations:* Links multiple `User` entities in private or group conversations.

## File Structure

The project follows a feature-based modular structure to maintain a clean codebase:

```text
Sleeknit-backend/
├── public/                 # Static assets (images, uploads)
├── src/                    # Main application source code
│   ├── config/             # Environment variables and configuration setup
│   ├── DB/                 # Database connection logic
│   ├── errors/             # Global error handling utilities
│   ├── helpers/            # Reusable helper functions
│   ├── interface/          # Global TypeScript interfaces
│   ├── logger/             # Winston logger configurations
│   ├── middlewares/        # Express app-level middlewares (auth, validation)
│   ├── modules/            # Feature-based domains (Core Logic)
│   │   ├── admin/          # Admin operations
│   │   ├── chat/           # Real-time messaging
│   │   ├── orders/         # Standard and custom order management
│   │   ├── product/        # Product and category management
│   │   ├── user/           # User authentication and profile
│   │   ├── vendor/         # Vendor specific operations
│   │   └── ... (other domains like showroom, reviews, payment, etc.)
│   ├── multer/             # File upload configurations
│   ├── routes/             # Centralized application routing
│   ├── utils/              # General utility classes and functions
│   ├── app.ts              # Express App setup and middleware injection
│   └── index.ts            # Entry point of the application
├── .env.sample             # Environment variable template
├── .eslintrc.json          # ESLint configuration
├── .gitignore              # Ignored files for Git
├── package.json            # Project dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

## Installation Guide

To get the backend up and running on your local machine, follow these steps:

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB running locally or a MongoDB Atlas URI
- Git

### 1. Clone the Repository

```bash
git clone <repository-url>
cd git-gotech
```

### 2. Install Dependencies

Install the necessary npm packages using:

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory and populate it based on the provided `.env.sample`:

```bash
cp .env.sample .env
```

Ensure the following critical variables are set in your `.env` file:
```env
DATABASE_URL="your-mongodb-connection-string"
JWT_SECRET_KEY="your-jwt-secret"
Nodemailer_GMAIL="your-email@gmail.com"
Nodemailer_GMAIL_PASSWORD="your-app-password"
UPLOAD_FOLDER="public/images"
AppName="Sleeknit"
endpoint_secret="your-stripe-webhook-secret"
```

### 4. Run the Application

**Development Mode:**
To run the server in development mode with hot-reloading (using `ts-node-dev`):

```bash
npm run dev
```

**Build & Production Mode:**
To compile TypeScript into JavaScript and run the production build:

```bash
npm run build
npm start
```

### 5. Linting and Formatting

To maintain code quality, you can run the following commands:
```bash
npm run lint         # Check for linting errors
npm run lint:fix     # Auto-fix linting errors
npm run prettier:fix # Format code with Prettier
```

---
*This README file is automatically generated for the Sleeknit Backend project overview.*
