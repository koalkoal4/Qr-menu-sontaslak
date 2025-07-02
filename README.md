# QR Menu Template

A reusable QR menu system for restaurants with real-time updates.

## Features
- Customer-facing mobile-optimized menu
- Admin panel with authentication
- Real-time updates using Supabase
- Product and category management
- Image uploads

## Setup

1. Create a Supabase project at https://supabase.io
2. Create tables:
   ```sql
   CREATE TABLE categories (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     name TEXT NOT NULL,
     display_order INTEGER
   );

   CREATE TABLE products (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     name TEXT NOT NULL,
     description TEXT,
     price NUMERIC NOT NULL,
     image_url TEXT,
     is_available BOOLEAN DEFAULT true,
     category_id UUID REFERENCES categories(id)
   );
   ```
3. Enable Realtime for both tables
4. Configure environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_BUSINESS_NAME="Your Restaurant Name"
```

## Installation

```bash
npm install
npm run dev
```

## Deployment

Deploy to Vercel:
1. Connect your GitHub repository
2. Add environment variables in project settings
3. Deploy!

## Customization
- Update colors in `tailwind.config.js`
- Modify layouts in `app/layout.tsx`
- Add/remove features in admin panel