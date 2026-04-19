# AI Waste Classification System 🌿

A production-quality web application that uses AI to classify waste images and provide recycling guidance.

## Features
- **AI Classification**: Instantly identify Plastic, Metal, Paper, Organic, and Glass.
- **Smart Chatbot**: Context-aware eco-assistant powered by Gemini.
- **Impact Tracking**: Personal dashboard to track recycling history and environmental impact.
- **Eco-friendly UI**: Clean, modern design with smooth animations.
- **Authentication**: Secure JWT-based login and signup.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Framer Motion.
- **Backend**: Node.js, Express, MongoDB, Mongoose.
- **AI**: Google Gemini API (1.5 Flash).

## Setup Instructions

### 1. Prerequisites
- Node.js installed.
- MongoDB installed locally or a MongoDB Atlas URI.
- Google Gemini API Key.

### 2. Backend Setup
1. Navigate to the `server` folder.
2. Edit the `.env` file:
   - `MONGODB_URI`: Your MongoDB connection string.
   - `GEMINI_API_KEY`: Your Google Gemini API Key.
3. Install dependencies: `npm install`
4. Start the server: `npm start` (or `node index.js`)

### 3. Frontend Setup
1. Navigate to the `client` folder.
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

### 4. Running the App
- Open your browser to the URL provided by Vite (usually `http://localhost:5173`).

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=your_uri
JWT_SECRET=your_secret
GEMINI_API_KEY=your_key
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_API_BASE_URL=http://localhost:5000
```
