# Database & Backend to Frontend Connection Guide

## Overview

Your Next.js application is set up with:
- **Database**: Supabase (PostgreSQL)
- **Backend**: Next.js API Routes & Server Actions
- **Frontend**: React with Next.js

This guide explains how the connection works and how to implement new features.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND (React)                       │
│              (app/ folder with pages)                    │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ↓ (fetch/apiClient)
┌─────────────────────────────────────────────────────────┐
│            BACKEND (Next.js API Routes)                  │
│         (app/API/Backend/ folder with route.ts)         │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ↓ (supabaseAdmin/supabaseClient)
┌─────────────────────────────────────────────────────────┐
│          DATABASE (Supabase PostgreSQL)                  │
│              (Cloud hosted database)                     │
└─────────────────────────────────────────────────────────┘
```

---

## Environment Variables Setup

Your `.env.local` file should contain:

```bash
# Supabase Public (safe for frontend)
NEXT_PUBLIC_SUPABASE_URL=https://rclqnjgfoqgsouxcfcjz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase Admin (secure - server-only)
SUPABASE_SERVICE_ROLE_KEY=sb_secret_DxmdIOO91-Q1teCtS2omsA_...
```

**Important**: 
- `NEXT_PUBLIC_*` variables are safe for frontend
- `SUPABASE_SERVICE_ROLE_KEY` is for server-side only and must never be exposed

---

## Connection Flow Example: Login

### 1. Frontend Component (LoginClient.tsx)
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  // User submits form with username/password
  const res = await loginAction(formData);
  
  // Handle response
  if (res?.error) {
    setError(res.error);
  } else if (res?.data) {
    // Set cookies and redirect
    window.location.href = "/Beranda_user";
  }
};
```

### 2. Server Action (action.ts)
```typescript
export async function loginAction(formData: FormData) {
  const username = formData.get("username");
  const password = formData.get("password");
  
  // Call database layer
  const { data, error } = await loginUser(username, password);
  
  return { data, error };
}
```

### 3. Database Layer (db.ts)
```typescript
export async function loginUser(username: string, password: string) {
  // Query Supabase database
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("username", username)
    .eq("password", password)
    .maybeSingle();
  
  return { data, error };
}
```

### 4. Supabase Database
```
users table:
├── id_user (PK)
├── username
├── password
├── role (admin, pembina, siswa)
├── email
└── ...other fields
```

---

## How Different Pages Connect to Database

### Pattern 1: Server Actions (Recommended for simple operations)

**Best for**: Forms, authentication, single operations

```typescript
// app/Feature/action.ts
"use server";

import { myDatabaseFunction } from "@/app/API/Backend/Feature/db";

export async function myServerAction(data: any) {
  const result = await myDatabaseFunction(data);
  return result;
}
```

**Usage in component**:
```typescript
// app/Feature/Page.tsx
"use client";

import { myServerAction } from "./action";

export default function Page() {
  const handleClick = async () => {
    const result = await myServerAction(someData);
  };
  
  return <button onClick={handleClick}>Submit</button>;
}
```

---

### Pattern 2: API Routes (Recommended for complex operations)

**Best for**: Public endpoints, external integrations, REST APIs

**Create route handler**:
```typescript
// app/API/Backend/Feature/route.ts
import { NextRequest, NextResponse } from "next/server";
import { featureFunction } from "./db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, error } = await featureFunction(body);
    
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }
    
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

**Call from frontend**:
```typescript
// app/Feature/Page.tsx
"use client";

import { apiPost } from "@/lib/apiClient";

export default function Page() {
  const handleClick = async () => {
    const result = await apiPost("/API/Backend/Feature", {
      param1: "value1",
      param2: "value2",
    });
    
    if (result.success) {
      console.log("Success:", result.data);
    } else {
      console.error("Error:", result.error);
    }
  };
  
  return <button onClick={handleClick}>Submit</button>;
}
```

---

## Database Layer (db.ts) Best Practices

### Template for new db.ts file:

```typescript
// app/API/Backend/FeatureName/db.ts

import { supabaseAdmin } from "@/library/SupabaseClient";

export async function getFeatureData(id: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("table_name")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Database error:", error.message);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { 
      data: null, 
      error: new Error("Database operation failed") 
    };
  }
}

export async function createFeature(payload: any) {
  try {
    const { data, error } = await supabaseAdmin
      .from("table_name")
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("Database error:", error.message);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { 
      data: null, 
      error: new Error("Database operation failed") 
    };
  }
}

export async function updateFeature(id: string, payload: any) {
  try {
    const { data, error } = await supabaseAdmin
      .from("table_name")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Database error:", error.message);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { 
      data: null, 
      error: new Error("Database operation failed") 
    };
  }
}

export async function deleteFeature(id: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("table_name")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Database error:", error.message);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { 
      data: null, 
      error: new Error("Database operation failed") 
    };
  }
}
```

---

## Verifying Connection

### 1. Check Health Endpoint

```typescript
// Client-side verification
const response = await fetch("/api/health");
const health = await response.json();

console.log(health);
// Output: { status: "ok", database: "connected", environment: "configured" }
```

### 2. Check All Connections

```typescript
// lib/connectionVerifier.ts provides utilities
import { checkAllConnections } from "@/lib/connectionVerifier";

const status = await checkAllConnections();
console.log(status);
// Output: { database: true, backend: true, environment: true, message: "✅ All connections verified" }
```

---

## Common Features Already Implemented

### 1. **Authentication (Login)**
- Frontend: `app/Login/`
- Backend: `app/API/Backend/Login/`
- Server Action: `app/Login/action.ts`

### 2. **User Registration (Daftar)**
- Frontend: `app/Daftar/`
- Backend: `app/API/Backend/Daftar/`
- Route: `app/API/Backend/Daftar/route.ts`

### 3. **Attendance (Absensi)**
- Frontend: `app/Absensi/`
- Backend: `app/API/Backend/Absensi/`
- Route: `app/API/Backend/Absensi/route.ts`

### 4. **QR Code Generation & Scanning**
- Generate: `app/API/Backend/generate-qr/`
- Scan: `app/API/Backend/scan/`
- Validate: `app/API/Backend/scan-validate/`

---

## Adding New Features

### Step 1: Create Database Layer
```bash
mkdir -p app/API/Backend/NewFeature
touch app/API/Backend/NewFeature/db.ts
```

### Step 2: Create API Route
```bash
touch app/API/Backend/NewFeature/route.ts
```

### Step 3: Create Frontend Component
```bash
mkdir -p app/NewFeature
touch app/NewFeature/Page.tsx
```

### Step 4: Use apiClient for Communication
```typescript
import { apiPost } from "@/lib/apiClient";

const result = await apiPost("/API/Backend/NewFeature", data);
```

---

## Troubleshooting

### Database Connection Issues

1. **Missing Environment Variables**
   - Check `.env.local` exists and has all required keys
   - Restart dev server: `npm run dev`

2. **Authentication Errors**
   - Verify `SUPABASE_SERVICE_ROLE_KEY` is valid
   - Check Supabase project settings
   - Ensure table permissions are correct

3. **Network Errors**
   - Check internet connection
   - Verify Supabase URL is accessible
   - Check browser console for CORS errors

### Backend Connection Issues

1. **API Routes Not Found**
   - Verify route file is in correct location: `app/API/Backend/*/route.ts`
   - Ensure file exports `GET`, `POST`, `PUT`, `DELETE` functions

2. **Server Actions Not Working**
   - Verify file has `"use server"` at top
   - Check function is being called correctly
   - Review server console for errors

---

## Performance Tips

1. **Use Server Actions for sensitive operations** (auth, admin actions)
2. **Use API Routes for public endpoints** (file uploads, webhooks)
3. **Implement caching** where appropriate
4. **Add pagination** for large result sets
5. **Use database indexes** for frequently queried fields

---

## Security Best Practices

1. ✅ Never expose `SUPABASE_SERVICE_ROLE_KEY` on frontend
2. ✅ Always validate input on backend
3. ✅ Implement role-based access control (RBAC)
4. ✅ Use prepared statements (Supabase handles this)
5. ✅ Set proper Row Level Security (RLS) policies
6. ✅ Sanitize user input before database operations

---

## Next Steps

1. Verify health check: `curl http://localhost:3000/api/health`
2. Test login flow: Navigate to `/Login`
3. Check browser console and server logs
4. Create new features following the patterns above

For questions, refer to:
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs
- This project's code examples in `app/API/Backend/`
