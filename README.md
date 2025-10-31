# Lunalé - Simple Storefront

This repository is a ready-to-run Node.js + Express + SQLite project for a small clothing storefront called **Lunalé**.

## What's included
- Node + Express server (`server.js`)
- SQLite database (`db.sqlite` will be created automatically)
- Simple admin pages to add products and bulk-upload CSV
- Frontend: `public/` (index, product page, admin, styles, scripts)
- Placeholder SVG product image

## Quick start (local)
1. Install dependencies:
   ```
   npm install
   ```
2. Run the server:
   ```
   npm start
   ```
3. Open `http://localhost:3000` in your browser.

## Add products
- Go to `/admin.html` to add products (with image) or upload a CSV.
- CSV format: `name,description,price,category,image`
  (image should match a filename in `public/images` or leave blank to use the placeholder).

## Deploy to Render
1. Push this repository to GitHub.
2. Create a new Web Service on Render.
3. Connect your GitHub repo and choose the branch.
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Set an environment variable for `PORT` if Render requires (Render sets it automatically).

Render supports SQLite for small projects; for production consider replacing SQLite with PostgreSQL and using cloud storage for images.

## GitHub
- To publish:
  ```
  git init
  git add .
  git commit -m "Initial Lunalé storefront"
  git branch -M main
  git remote add origin <your-github-repo-url>
  git push -u origin main
  ```

## Branding
- Site uses a soft powder-pink + white + light-gold theme and a minimal "Lunalé" wordmark in the header.

## Notes
- This project is intentionally simple for easy deployment and later iteration.
