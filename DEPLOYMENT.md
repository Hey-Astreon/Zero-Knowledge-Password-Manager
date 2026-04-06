# 🚀 Ultimate Deployment Guide (Vercel + Render + MongoDB Atlas)

Since you want to go the professional route, this guide will walk you through deploying **Alyra Lock** using the industry-standard "Free Mode" stack.

---

### Phase 1: The Database (MongoDB Atlas)
1.  Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up for a **Free Shared Cluster**.
2.  Once your cluster is created, click **"Connect"**.
3.  Choose **"Drivers"** and copy the **Connection String** (something like `mongodb+srv://<db_username>:<db_password>@cluster0.abc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`).
4.  **Important**: Keep your `db_username` and `db_password` nearby.

---

### Phase 2: The Backend (Render.com)
1.  Go to [Render.com](https://render.com) and create a free account.
2.  Click **"New"** → **"Web Service"**.
3.  Connect your GitHub repository.
4.  **Settings**:
    -   **Name**: `alyra-lock-backend`
    -   **Root Directory**: `backend`
    -   **Runtime**: `Node`
    -   **Build Command**: `npm install && npm run build`
    -   **Start Command**: `npm run start`
5.  **Environment Variables** (Add these one by one):
    -   `MONGO_URI`: (Your Atlas string from Phase 1)
    -   `JWT_SECRET`: (Any long random string, e.g., `SuperSecret123!`)
    -   `NODE_ENV`: `production`
    -   `CLIENT_URL`: `https://alyra-lock-frontend.vercel.app` (You will update this later with your actual Vercel link)
6.  Click **"Create Web Service"**.

---

### Phase 3: The Frontend (Vercel)
1.  Go to [Vercel](https://vercel.com) and sign in with GitHub.
2.  Click **"Add New"** → **"Project"**.
3.  Import your repository.
4.  **Settings**:
    -   **Framework Preset**: `Next.js`
    -   **Root Directory**: `frontend`
5.  **Environment Variables**:
    -   `NEXT_PUBLIC_API_URL`: (The URL Render gives you, ended with `/api`) e.g., `https://alyra-lock-backend.onrender.com/api`
6.  Click **"Deploy"**.

---

### 🖇️ Final "Link Up" Step
Once Vercel gives you your final frontend URL (e.g., `https://alyra-lock-123.vercel.app`):
1.  Go back to **Render** Settings.
2.  Update the `CLIENT_URL` environment variable to this exact Vercel link.
3.  This is required so the backend allows your frontend to "talk" to it (CORS).

---

### ⚠️ Common Beginner Mistakes
-   **Wrong Password**: In the Atlas connection string, replace `<db_password>` (including the brackets) with your actual password.
-   **Missing /api**: In the frontend's `NEXT_PUBLIC_API_URL`, forget to add `/api` at the end of your Render link.
-   **Network Access**: In MongoDB Atlas, ensure you set "IP Access List" to `0.0.0.0/0` (Allow Access from Anywhere) so Render can connect to your DB!
-   **Root Directory**: Make sure you tell Vercel and Render about the `frontend` and `backend` subfolders!

You're all set! Follow these steps and your app will be online globally in minutes!
