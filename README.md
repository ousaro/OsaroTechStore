# E-Commerce App

A robust, full-featured online store built with the **MERN stack** (MongoDB, Express, React, Node.js), offering a modern shopping experience with secure payment integration and advanced admin management.

## 🌟 Features

- **Modern UI/UX**: Designed with **Tailwind CSS** for a responsive and visually appealing interface.
- **Home & Product Pages**: Browse and view detailed product information.
- **Add to Cart & Filtering**: Seamless product filtering and cart management.
- **Secure Payments**: Integrated with **Stripe** for secure and smooth transactions.
- **Admin Dashboard**: Manage products, users, and orders with data-driven insights and analytics.
- **Real-Time Analytics**: Admin insights into sales data, user activity, and overall performance.

## 🚀 Live Demo

👉 [Check out our e-commerce app here](https://osaro-tech-store.vercel.app/LogIn)  
*Sign up with Google to explore the platform. Admin access is restricted but showcased in the demo video.*

## 🛠️ Tech Stack

- **Frontend**: React, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Payment Gateway**: Stripe
- **DevOps**: Docker, Kubernetes, CI/CD pipelines

## 🔧 DevOps & Deployment

Explore the DevOps practices behind this app, including **CI/CD**, **Kubernetes**, and **Docker** configurations on GitLab:

👉 [View DevOps practices on GitLab](https://gitlab.com/ousaro/osarotechstore_blogseries)

## 📸 Admin Dashboard Preview

*Admin functionality is not accessible in the live demo. Watch the video below for a preview of the admin features.*

## 📂 Installation & Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/ecommerce-app.git
   cd ecommerce-app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
## 🔑 Environment Variables Setup

To successfully run this project, you need to set up environment variables for both the backend and frontend. These variables store sensitive information such as API keys, database connections, and other configuration settings. Follow the steps below to create the necessary environment files.

### Backend Environment Variables

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a `.env` file:
   ```bash
   touch .env
   ```
3. Open the `.env` file and add:
   ```env
   PORT=your_backend_port
   CLIENT_URL=your_client_url
   MONGO_URI=your_mongo_db_uri
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   SESSION_SECRET=your_session_secret
   CALLBACK_URL=your_callback_url
   TOKEN_SECRET=your_token_secret
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   ```

### Frontend Environment Variables

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Create a `.env` file:
   ```bash
   touch .env
   ```
3. Open the `.env` file and add:
   ```env
   REACT_APP_API_URL=your_api_url
   REACT_APP_GOOGLE_API_URL=your_google_api_url
   REACT_APP_FOR_PASSWORD_RESET=your_password_reset_url
   REACT_APP_STRIPE_PUBLIC_KEY=your_stripe_public_key
   ```

Replace all placeholder values with your actual configuration.

### Run the app:
1. Run the development server:
   ```bash
   npm run dev
   ```
2. Run the frontend :
    ```bash
   npm start
   ```

## 📄 License

This project is licensed under the MIT License.
