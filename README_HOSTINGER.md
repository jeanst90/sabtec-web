# Deploy Hostinger (Node.js Web App)

1. Upload the project to your hosting (or clone from Git).
2. Install dependencies: `npm ci`
3. Build: `npm run build`
4. Set environment variables in Hostinger (Node.js app):
   - NEXT_PUBLIC_SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY
   - AUTH_SECRET (optional)
   - NEXT_PUBLIC_APP_URL
   - RESEND_API_KEY (optional)
5. Start command: `npm start` (uses server.js)
6. Point the app to port 3000 or let Hostinger assign PORT.
7. Login: jeanst90@live.com / Timao1910@

Notes:
- server.js uses PORT/HOSTNAME
- middleware.ts protects dashboard/routes
- /login is public
