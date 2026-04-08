# Deployment Guide

## Frontend — Vercel

.....................................
### Steps:
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click **"New Project"** → Import your repository
4. Set **Root Directory** to `frontend`
5. Framework Preset: **Vite**
6. Build Command: `npm run build`
7. Output Directory: `dist`
8. Add Environment Variable:
   - `VITE_API_URL` = `https://your-backend-url.onrender.com/api`
9. Click **Deploy**

### Notes:
- Update `AuthContext.jsx` to use `import.meta.env.VITE_API_URL` instead of hardcoded localhost
- Add a `vercel.json` for SPA rewrites:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## Backend — Render

### Steps:
1. Go to [render.com](https://render.com) and sign in
2. Click **"New Web Service"**
3. Connect your GitHub repo
4. Set **Root Directory** to `backend`
5. Build Command: `npm install`
6. Start Command: `node server.js`
7. Add Environment Variables:
   - `MONGO_URI` = your MongoDB Atlas connection string
   - `JWT_SECRET` = a strong secret key
   - `PORT` = `5000`
8. Click **Deploy**

### Notes:
- Update CORS origin in `server.js` to your Vercel frontend URL
- Render free tier may spin down after inactivity (expect cold starts)

---

## MongoDB Atlas

### Steps:
1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free cluster (M0 Sandbox)
3. Create a database user with username/password
4. Whitelist IP: Add `0.0.0.0/0` (allow all) for Render access
5. Get connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/academic-portal?retryWrites=true&w=majority
   ```
6. Use this as `MONGO_URI` in both local `.env` and Render env vars

### Seed Data on Production:
```bash
# Set MONGO_URI to your Atlas connection string
MONGO_URI="mongodb+srv://..." node seedData.js
```

---

## Environment Variables Summary

| Variable | Platform | Value |
|----------|----------|-------|
| `MONGO_URI` | Render | MongoDB Atlas connection string |
| `JWT_SECRET` | Render | Strong random secret |
| `PORT` | Render | 5000 |
| `VITE_API_URL` | Vercel | Backend URL + `/api` |
