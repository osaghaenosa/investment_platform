# Aurum Capital investor portal (Next.js)

1. `npm install`
2. `cp .env.example .env.local` and fill in your Flutterwave secret key and SMTP details
3. `npm run dev` then open http://localhost:3000

Flutterwave: use your **test** secret key first. Set the webhook URL to `APP_URL/api/webhook`
and the secret hash to the same value as `FLW_SECRET_HASH`.

Before going live: replace lib/db.js with a real database, have a lawyer review lib/config.js (TERMS),
and rename the brand in lib/config.js.
