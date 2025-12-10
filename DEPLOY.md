# Deployment Guide (Vercel + Supabase)

This guide explains how to publish your **ICU TextLink** app so others can access it via a public link (e.g., `https://icu-textlink.vercel.app`).

## Prerequisites
-   **GitHub Account**: [Create one here](https://github.com/join)
-   **Vercel Account**: [Create one here](https://vercel.com/signup) (Log in with GitHub recommended)

---

## Step 1: Push Code to GitHub
You need to upload your code to a GitHub repository.

1.  Open [GitHub](https://github.com/new) and create a new repository.
    -   Repository name: `icu-textlink` (or anything you like)
    -   Visibility: **Public** or **Private** (Private is fine)
    -   **Do not** initialize with README, .gitignore, or License (we already have them).
2.  After creating, you will see a list of commands. Copy the commands under **"…or push an existing repository from the command line"**.
3.  Paste and run them in your terminal (VS Code). They will look like this:

```bash
git remote add origin https://github.com/YOUR_USERNAME/icu-textlink.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy to Vercel
Connect your GitHub repository to Vercel to host the website.

1.  Go to the [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **"Add New..."** -> **"Project"**.
3.  Find your `icu-textlink` repository and click **"Import"**.
4.  **Configure Project**:
    -   **Framework Preset**: Next.js (Default)
    -   **Root Directory**: `./` (Default)
    -   **Environment Variables** (IMPORTANT!):
        Expand this section and add the variables from your local `.env.local` file:
        -   `NEXT_PUBLIC_SUPABASE_URL`: (Copy value from .env.local)
        -   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (Copy value from .env.local)
5.  Click **"Deploy"**.

Wait about 1-2 minutes. Once finished, you will get a public URL (Domain).

---

## Step 3: Configure Supabase Redirects
To make "Log In" works on the deployed site, you must tell Supabase your new URL.

1.  Go to [Supabase Dashboard](https://supabase.com/dashboard) -> `Authentication` -> `URL Configuration`.
2.  In **"Site URL"**, enter your Vercel URL (e.g., `https://icu-textlink.vercel.app`).
3.  In **"Redirect URLs"**, add the following (replace with your actual Vercel domain):
    -   `https://icu-textlink.vercel.app/**`
    -   `https://icu-textlink.vercel.app/auth/callback`
4.  Click **"Save"**.

---

## Step 4: Share!
Send the Vercel link to your friends. They can now:
1.  Sign Up (with `@icu.ac.jp` email).
2.  Receive the verification code.
3.  Log in and use the app!
