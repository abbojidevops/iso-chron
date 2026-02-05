# ISO-CHRON: Molecular Skincare Audit

A "Premium" Next.js 15+ application for skincare analysis using 3D micro-interactions and rigorous chemical logic.

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 + Glassmorphism
- **3D Visuals**: Three.js / React Three Fiber
- **Auth**: Clerk
- **Database**: Supabase
- **Payments**: Stripe

## 🚀 Getting Started

### 1. Environment Setup

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Fill in your API keys:
- **Clerk**: [Get keys from Clerk Dashboard](https://dashboard.clerk.com)
- **Supabase**: [Get keys from Supabase Dashboard](https://supabase.com/dashboard)
- **Stripe** (Optional for now): Stripe keys.

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📦 Deployment (Vercel)

1. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/iso-chron.git
   git push -u origin master
   ```

2. **Deploy on Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/new).
   - Import your `iso-chron` repository.
   - **Important**: Add your Environment Variables (Clerk, Supabase) in the Vercel Project Settings.
   - Click **Deploy**.

## 🧬 Features

- **Molecular Audit Dashboard**: Analyze product conflicts (e.g., Retinol + Vitamin C).
- **3D Digital Twin**: Interactive serum bottle visualization.
- **Glassmorphism UI**: High-end aesthetic.

## ⚠️ Troubleshooting

- **Build Errors**: Ensure all environment variables are set correctly in Vercel.
- **GLTF Errors**: If you add custom 3D models, place them in `public/models`.
