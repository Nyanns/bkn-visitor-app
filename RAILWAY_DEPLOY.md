# 🚀 Railway Deployment Guide

This guide will help you deploy the **BKN Visitor Management System** to [Railway.app](https://railway.app).

## Prerequisites
- GitHub Account (connected to this repository)
- Railway Account (login with GitHub)

---

## 🏗️ Step 1: Create Project in Railway

1.  Open [Railway Dashboard](https://railway.app/dashboard).
2.  Click **"New Project"**.
3.  Select **"Deploy from GitHub repo"**.
4.  Choose your repository: **`Nyanns/bkn-visitor-app`**.
5.  Click **"Add Variables"** (we will configure them later).
6.  Click **"Deploy Now"** (It might fail initially, don't panic! We will fix the configuration).

---

## 🗄️ Step 2: Configure Database (PostgreSQL)

1.  In your Railway project view, right-click on the canvas (empty space).
2.  Select **"Database"** -> **"Add PostgreSQL"**.
3.  Wait for it to initialize.
4.  Click on the new **PostgreSQL** card.
5.  Go to the **"Connect"** tab.
6.  Copy the **"DATABASE_URL"** (it starts with `postgresql://...`).

---

## ⚙️ Step 3: Configure Backend Service

1.  Click on your repository card (it holds the code).
2.  Go to **"Settings"**.
3.  Scroll down to **"Root Directory"**.
4.  Change it to: `/backend` (This is crucial!).
5.  Go to the **"Variables"** tab.
6.  Add the following variables:
    - `DATABASE_URL`: Paste the PostgreSQL URL you copied earlier.
    - `SECRET_KEY`: Generate a random string (e.g., `super-secret-key-123`).
    - `ALLOWED_ORIGINS`: `*` (or your frontend URL after Step 4).
    - `ALLOW_SETUP_ADMIN`: `true` (only for first deployment to create admin).
7.  Railway will automatically redeploy. Open the **"Deployments"** tab to watch the logs.
8.  Once "Active", click the generated URL (e.g., `https://web-production-xxxx.up.railway.app`). You should see `{"status":"ok"}`.

---

## 🎨 Step 4: Configure Frontend Service (Optional)

*If you want to host the frontend on Railway too:*

1.  In the project canvas, click **"New"** button (top right or empty space).
2.  Select **"GitHub Repo"** again and pick the **same repository**.
3.  Click on the **newly created service card**.
4.  Go to **"Settings"**.
5.  Change **"Root Directory"** to: `/frontend`.
6.  Go to **"Variables"** tab.
7.  Add:
    - `VITE_API_URL`: The URL of your **Backend Service** (from Step 3, e.g., `https://backend-xxxx.up.railway.app`).  
      **IMPORTANT**: Do *not* add a trailing slash `/`.
8.  It will redeploy. Once active, your app is live!

---

## 📝 Final Steps

1.  Open your Frontend URL.
2.  Try to login/register.
3.  **Security**: Go back to Backend Variables and set `ALLOW_SETUP_ADMIN` to `false`.

## 🐛 Troubleshooting

- **Logs**: Always check the "Deployments" -> "View Logs" tab if something fails.
- **Build Failed**: Ensure `requirements.txt` (backend) or `package.json` (frontend) is correct.
- **Database Error**: Verify `DATABASE_URL` is correct in Backend Variables.

Happy Deploying! 🚀
