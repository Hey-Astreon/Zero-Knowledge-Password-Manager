# 🏠 Local Deployment Guide (Beginner Friendly)

Since you want to learn deployment without using cloud services or spending any money, this guide will show you how to run **Alyra Lock** in "Production" mode on your own computer.

## What is Local Deployment?
So far, you have been using `npm run dev`. This is for **development**—it's slow but easy to change code. 
**Deployment** (Production mode) means we "build" the project into optimized files that run much faster and are more secure.

---

### Step 1: Build the Backend
1.  Open a terminal in the `backend` folder.
2.  Run: `npm run build`
    -   This converts your TypeScript into optimized JavaScript inside the `dist` folder.
3.  Run: `npm start`
    -   This starts the production server on Port 5000.

### Step 2: Build the Frontend
1.  Open a terminal in the `frontend` folder.
2.  Run: `npm run build`
    -   Next.js will now optimize all your pages and CSS. This may take 1-2 minutes.
3.  Run: `npm start`
    -   Your frontend is now live on Port 3000 in production mode!

---

### Step 3: Accessing from Other Devices (Your local "Cloud")
If you want your friends (on the same Wi-Fi) to see your app:
1.  Find your computer's local IP address (Run `ipconfig` in CMD and look for `IPv4 Address`, e.g., `192.168.1.15`).
2.  On their phone/laptop browser, they can go to `http://192.168.1.15:3000`.

---

### Step 4: Making it Public (Optional & Free)
If you want someone in another city to test it for free:
1.  Download [ngrok](https://ngrok.com/).
2.  In your terminal, run: `ngrok http 3000`.
3.  It will give you a public URL (like `https://xyz.ngrok-free.app`) that anyone in the world can open!

---

### Important Checklist
-   **MongoDB**: Keep your local MongoDB running (or your `mongod` window open).
-   **Envs**: Your `.env` files stay the same since everything is local!
-   **Performance**: You will notice the production version is MUCH faster to load than the development version.

Congratulations! You just "deployed" your first full-stack application on your own local server.
