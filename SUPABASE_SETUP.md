# Setup Guide: Supabase Service Role Key

## Why This Is Needed

The Generate.Qr endpoint needs the Supabase **Service Role Key** to bypass row-level security (RLS) policies and insert data into the `qr_session` table. Without it, the endpoint fails with: 
```
"new row violates row-level security policy for table qr_session"
```

## How to Get Your Service Role Key

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Select your project
3. Navigate to **Settings** → **API**
4. Under "Project API keys", find the **Service role** key (labeled "service_role secret")
5. Click the eye icon or "Copy" button to reveal it

## How to Add It to .env.local

Add this line to your `.env.local` file:
```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

Replace `your-service-role-key-here` with the actual key from your Supabase dashboard.

⚠️ **IMPORTANT**: The service role key is secret and should NEVER be committed to version control or exposed publicly. Keep it in `.env.local` only (which should be in .gitignore).

## Testing After Adding the Key

1. Restart the dev server: `npm run dev`
2. Test the endpoint:
```bash
curl -X POST http://localhost:3000/api/Backend/Generate.Qr \
  -H "Content-Type: application/json" \
  -d '{"id_eskul": "1"}'
```

You should get a successful response with the QR code image and token.
