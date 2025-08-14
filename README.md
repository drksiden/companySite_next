# Company Site - Next.js E-commerce Platform

A modern e-commerce platform built with Next.js 14 (App Router), TypeScript, shadcn/ui, Tailwind CSS, Supabase, and Cloudflare R2.

## ✨ Features

- **Modern Stack**: Next.js 14 App Router, TypeScript, shadcn/ui, Tailwind CSS
- **Database**: Supabase with Row Level Security (RLS)
- **File Storage**: Cloudflare R2 (S3-compatible) with presigned URLs
- **Image Optimization**: Sharp-based API with WebP/AVIF support
- **Catalog System**: Advanced filtering, sorting, pagination
- **Admin Panel**: Product management, inventory tracking
- **Authentication**: Supabase Auth with role-based access

## 📁 Project Structure

```
├── docs/                        # Project documentation
├── scripts/                     # Development and deployment scripts
├── src/
│   ├── app/                     # Next.js 14 App Router
│   │   ├── api/                 # API routes
│   │   ├── catalog/             # Catalog pages
│   │   └── admin/               # Admin panel
│   ├── components/              # Shared components
│   ├── features/                # Feature-specific components
│   │   ├── catalog/             # Catalog components
│   │   └── upload/              # File upload components
│   ├── lib/                     # Utilities and configurations
│   │   ├── services/            # Business logic layer
│   │   ├── r2.ts               # Cloudflare R2 client
│   │   └── supabase*.ts        # Supabase clients
│   └── types/                   # TypeScript definitions
├── supabase/                    # Database migrations
└── tests/                       # Test files
    ├── api/                     # API tests
    └── utils/                   # Utility tests
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- pnpm (recommended)
- Supabase account
- Cloudflare R2 account

### Installation

1. Clone and install:
```bash
git clone <repository-url>
cd companySite_next
pnpm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```
Edit `.env.local` with your configuration (see [Environment Setup](#environment-setup)).

3. Run the development server:
```bash
pnpm dev
```

4. Run tests:
```bash
# Quick tests (utilities only, no server required)
pnpm test:utils

# All tests (requires running dev server)
pnpm test:all
```
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

## 🧪 Testing

The project includes comprehensive tests for API endpoints and utility functions.

### Available Test Commands

```bash
pnpm test:quick   # Essential tests (utils + basic API if server running)
pnpm test:all     # All tests (requires dev server)
pnpm test:api     # API tests only (requires dev server)  
pnpm test:utils   # Utility tests only (no server required)
```

### Running Individual Tests

```bash
# Test price formatting
node tests/utils/formatPrice.test.js

# Test catalog API
node tests/api/catalog.test.js
```

See [tests/README.md](tests/README.md) for detailed testing documentation.

## 📚 Documentation

- **[Environment Setup](docs/supabase_architecture.md)** - Supabase & Cloudflare R2 configuration
- **[API Documentation](docs/FINAL_REFACTORING_SUMMARY.md#api-documentation)** - Complete API reference
- **[Testing Guide](tests/README.md)** - How to run and create tests
- **[Project Architecture](docs/VERIFICATION_SUMMARY.md)** - Technical details and structure
- **[Action Plan](docs/REFACTORING_ACTION_PLAN.md)** - Step-by-step setup guide

## 🛠️ Development

### Environment Variables Required

Add to `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Cloudflare R2
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_ENDPOINT=https://account-id.r2.cloudflarestorage.com
R2_PUBLIC_BUCKET=your-bucket-name
R2_PUBLIC_BASE_URL=https://pub-xxx.r2.dev
R2_UPLOAD_MAX_MB=20
```

### Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm typecheck    # Check TypeScript
pnpm test:quick   # Run essential tests
pnpm test:all     # Run all tests
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### Get Categories
```
GET /api/catalog/categories
```

#### Get Brands
```
GET /api/catalog/brands
```

#### Get All Catalog Data
```
GET /api/catalog
```

Returns categories, brands, and collections in one request.

### Upload API

#### Get Presigned Upload URL
```
POST /api/upload
Content-Type: application/json

{
  "fileName": "image.jpg",
  "contentType": "image/jpeg"
}
```

**Response:**
```json
{
  "success": true,
  "uploadUrl": "https://presigned-url",
  "key": "images/2024/01/15/uuid_image.jpg",
  "publicUrl": "https://cdn.example.com/images/2024/01/15/uuid_image.jpg",
  "maxMb": 20,
  "expiresIn": 300
}
```

### Image Optimization API

```
GET /api/images/optimize?src=image-url&w=600&h=400&q=80&f=webp
```

**Parameters:**
- `src` (string): Source image URL
- `w` (number): Width (1-4000px)
- `h` (number): Height (1-4000px) 
- `q` (number): Quality (1-100)
- `f` (string): Format - `jpeg|png|webp|avif`
- `preset` (string): Preset size - `thumbnail|card|gallery|fullscreen`
- `fit` (string): Resize fit - `cover|contain|fill|inside|outside`

## File Upload Workflow

1. **Client** requests presigned URL from `/api/upload`
2. **Server** validates file type and generates R2 key
3. **Server** returns presigned PUT URL and public URL
4. **Client** uploads file directly to R2 using presigned URL
5. **Client** saves public URL in database/form

```tsx
// Example usage
import ImageUploader from '@/features/upload/ImageUploader';

function MyComponent() {
  return (
    <ImageUploader
      onUploadComplete={(result) => {
        console.log('File uploaded:', result.publicUrl);
        // Save result.publicUrl to your form/database
      }}
      maxSizeInMB={10}
    />
  );
}
```

## Architecture

### Directory Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   │   ├── catalog/       # Catalog endpoints
│   │   ├── upload/        # File upload
│   │   └── images/        # Image optimization
│   ├── catalog/           # Catalog pages
│   └── ...
├── components/
│   └── ui/                # shadcn/ui components
├── features/
│   ├── catalog/           # Catalog-specific components
│   └── upload/            # Upload components
├── lib/
│   ├── services/          # Server-side business logic
│   ├── r2.ts             # Cloudflare R2 client
│   ├── supabaseClient.ts  # Client-side Supabase
│   ├── supabaseServer.ts  # Server-side Supabase
│   ├── imageUtils.ts      # Image utilities
│   └── schemas.ts         # Zod validation schemas
└── types/                 # TypeScript definitions
```

### Key Design Decisions

- **Server-Side Services**: All database operations in `src/lib/services/`
- **Unified Clients**: Single Supabase and R2 client modules
- **Type Safety**: Zod schemas for API validation
- **Image Strategy**: Direct R2 uploads with presigned URLs
- **Caching**: Static data cached, dynamic catalog with `no-store`

## Development Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run typecheck    # TypeScript type checking

# Testing
npm run test         # Run tests (when configured)
```

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Environment Variables for Production

Make sure to set all required environment variables:

- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- R2: `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`, `R2_PUBLIC_BUCKET`, `R2_PUBLIC_BASE_URL`
- Site: `NEXT_PUBLIC_SITE_URL`

## Testing

### Manual Testing

#### Test File Upload
1. Navigate to any form with file upload
2. Test uploading various image formats (JPEG, PNG, WebP, AVIF, GIF)
3. Try uploading files larger than the size limit (should fail gracefully)
4. Verify uploaded files are accessible via public URLs

#### Test Catalog Functionality
1. **Products API**: `GET /api/catalog/products?page=1&limit=20`
2. **Categories API**: `GET /api/catalog/categories`
3. **Brands API**: `GET /api/catalog/brands`
4. **Filters**: Test category, brand, price range, and search filters
5. **Sorting**: Test all sort options (name, price, date)
6. **Pagination**: Navigate through multiple pages

#### Test Image Optimization
1. **Basic optimization**: `/api/images/optimize?src=IMAGE_URL&w=600&h=400&q=80&f=webp`
2. **Preset sizes**: Use preset parameters (`thumbnail`, `card`, `gallery`, `fullscreen`)
3. **Different formats**: Test JPEG, PNG, WebP, AVIF output

#### Test UI Components
1. **Catalog Shell**: 
   - Filters sidebar (desktop/mobile)
   - Sort dropdown
   - Product grid/list view toggle
   - Pagination controls
2. **Product Cards**: 
   - Different sizes (small, medium, large)
   - Hover effects and actions
   - Wishlist and quick view buttons
3. **Empty States**: Clear filters and observe empty state

### Test Checklist

- [ ] File upload works with presigned URLs
- [ ] Images display correctly with next/image
- [ ] Catalog filters and sorting work
- [ ] Pagination navigates correctly
- [ ] Mobile responsive design
- [ ] Loading states show properly
- [ ] Error states handle gracefully
- [ ] TypeScript compilation passes: `npm run typecheck`
- [ ] ESLint checks pass: `npm run lint`
- [ ] No console errors in browser

## Deployment

### Environment Variables Checklist

Before deploying, ensure all required environment variables are set:

**Supabase:**
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`

**Cloudflare R2:**
- [ ] `R2_ACCESS_KEY_ID`
- [ ] `R2_SECRET_ACCESS_KEY`
- [ ] `R2_ENDPOINT`
- [ ] `R2_PUBLIC_BUCKET`
- [ ] `R2_PUBLIC_BASE_URL`
- [ ] `R2_UPLOAD_MAX_MB` (optional, defaults to 20)

**Site Configuration:**
- [ ] `NEXT_PUBLIC_SITE_URL`

### Vercel Deployment

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel --prod
   ```

2. **Add Environment Variables**
   - Go to Vercel Dashboard → Project
