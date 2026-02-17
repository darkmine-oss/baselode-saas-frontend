# baselode-saas-frontend
Web app to access public geological and mining data sets. It relies on the baselode packages for visualisation and data manipulation.

## Development

### Prerequisites
- Node.js 20+
- npm 10+

### Run locally
1. Install dependencies:
	```bash
	npm install
	```
2. Create your local env file:
	```bash
	cp .env.example .env.local
	```
3. Set `VITE_API_BASE_URL` in `.env.local` to your backend URL.
4. Start the app:
	```bash
	npm run dev
	```

## Build

```bash
npm run build
```

## Deploy to Vercel

This project is configured for static Vite deployment on Vercel.

### Required Vercel environment variables
- `VITE_API_BASE_URL` (your production backend base URL)

### Notes
- `vercel.json` includes a SPA rewrite so direct navigation to routes like `/dashboard` resolves to `index.html`.
- Vercel should detect framework settings automatically (`vite build` and output `dist`).
