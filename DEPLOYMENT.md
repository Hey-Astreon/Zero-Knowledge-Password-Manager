# 🚢 Alyra Lock Deployment Blueprint

This guide provides a professional "Best Practices" path to deploy **Alyra Lock** in a secure, scalable production environment using specialized cloud providers (Vercel, Render, and MongoDB Atlas).

## Phase 1: Database (MongoDB Atlas)
Never use local MongoDB for production. Move to the cloud:
1.  Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  Deploy a free "Shared Cluster".
3.  **Network Access**: Add `0.0.0.0/0` (Allow all IP access) for ease of deployment.
4.  **Database Access**: Create a user with a secure password.
5.  **Connection String**: Copy the SRV string (e.g., `mongodb+srv://user:pass@cluster.mongodb.net/alyra_lock`).

## Phase 2: Backend (Render.com)
The backend requires a server that supports long-running Node.js processes.
1.  Connect your GitHub repository to [Render.com](https://render.com).
2.  Choose **"Web Service"**.
3.  **Settings**:
    -   **Root Directory**: `backend`
    -   **Build Command**: `npm install && npm run build`
    -   **Start Command**: `npm run start`
4.  **Environment Variables**:
    -   `NODE_ENV`: `production`
    -   `PORT`: `10000` (Render's default)
    -   `MONGO_URI`: (Your Atlas SRV string)
    -   `JWT_SECRET`: (Generate a long, random string)
    -   `CLIENT_URL`: (Your Vercel URL, set *after* Phase 3)

## Phase 3: Frontend (Vercel)
Vercel is the native home for Next.js and ensures maximum performance.
1.  Connect your GitHub repository to [Vercel](https://vercel.com).
2.  **Settings**:
    -   **Root Directory**: `frontend`
    -   **Framework Preset**: Next.js
3.  **Environment Variables**:
    -   `NEXT_PUBLIC_API_URL`: (Render URL + `/api`) e.g., `https://alyra-backend.onrender.com/api`

## Phase 4: Final Connection (CORS)
Once Vercel gives you a production domain (e.g., `alyra-lock.vercel.app`):
1.  Go back to **Render** Settings.
2.  Update the `CLIENT_URL` to your Vercel address.
3.  The backend will automatically redeploy and allow calls from your frontend.

---

### Deployment Checklist (Security)
-   [ ]   **No Plaintext**: Ensure `backend/src/config/db.ts` uses `process.env.MONGO_URI` (I have updated this for you).
-   [ ]   **Rate Limiting**: The backend already includes an API limiter to prevent brute-force attacks.
-   [ ]   **Secure Cookies**: Ensure `withCredentials: true` is maintained for ZK-Auth handling.
-   [ ]   **HTTPS**: Both Render and Vercel will provide SSL/HTTPS automatically.

---

### Alternative: Single-Server (Docker)
If you have a Linux VPS (DigitalOcean/Linode):
1.  Install **Docker** and **Docker Compose**.
2.  Use a `docker-compose.yml` logic to manage services together.
