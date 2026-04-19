# AI Waste Classification System 🌿

A production-quality full-stack application that uses AI to classify waste images and provide recycling guidance. Now migrated to a cloud-native architecture with Supabase and Groq.

## Features
- **Dual-AI Classification**: High-speed image analysis powered by **Groq Vision** (Llama 4) with **Gemini 2.0** fallback.
- **Resilient Chatbot**: Context-aware eco-assistant using **Groq** for ultra-low latency responses.
- **Cloud Persistence**: Full data synchronization with **Supabase (PostgreSQL)** and **Supabase Storage**.
- **Secure Auth**: Google Social Login and Email authentication powered by **Firebase Auth**.
- **Modern Dashboard**: Track your recycling history and environmental impact in real-time.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Framer Motion, Firebase SDK.
- **Backend**: Node.js, Express, Supabase SDK, Groq SDK, Google Generative AI SDK.
- **Database & Storage**: Supabase (PostgreSQL & Object Storage).
- **Authentication**: Firebase Admin.

## Setup Instructions

### 1. Prerequisites
- Node.js installed.
- Supabase Project (URL & Anon Key).
- Firebase Project (Service Account JSON).
- Groq API Key.
- Google Gemini API Key (Fallback).

### 2. Backend Setup
1. Navigate to the `server` folder.
2. Configure `.env`:
   - `PORT=5001`
   - `SUPABASE_URL`, `SUPABASE_KEY`
   - `GROQ_API_KEY`, `GEMINI_API_KEY`
   - `JWT_SECRET`
3. Add your `serviceAccountKey.json` from Firebase.
4. `npm install` && `npm start`

### 3. Frontend Setup
1. Navigate to the `client` folder.
2. Configure `.env`:
   - `VITE_API_URL=http://localhost:5001/api`
3. `npm install` && `npm run dev`

## Deployment
- **Frontend**: Recommended for **Vercel**.
- **Backend**: Recommended for **Render**.
