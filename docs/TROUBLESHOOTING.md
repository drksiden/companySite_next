# Troubleshooting Guide

## Next.js Image Component Issues

### Problem: "hostname is not configured under images in your next.config.js"

**Error message:**
```
Invalid src prop (https://pub-1506276de6ac4a07aa6fe582457507c1.r2.dev/...) on `next/image`, hostname "pub-1506276de6ac4a07aa6fe582457507c1.r2.dev" is not configured under images in your `next.config.js`
```

**Solution:**
1. The R2 domain is already configured in `next.config.js`
2. **Restart the development server** after any changes to `next.config.js`:
   ```bash
   # Stop the server (Ctrl+C)
   pnpm dev
   ```

3. If the issue persists, clear Next.js cache:
   ```bash
   rm -rf .next
   pnpm dev
   ```

### Alternative Solution: Using Regular img Tags

The ProductFormNew component has been updated to use regular `<img>` tags instead of Next.js `<Image>` components for uploaded files. This provides:

- Immediate compatibility with any domain
- Better error handling with fallback images
- No need for domain configuration

**Benefits:**
- ✅ Works with any R2 domain immediately
- ✅ Graceful error handling with fallback SVG
- ✅ No configuration required
- ✅ Consistent sizing with Tailwind classes

## File Upload Issues

### Problem: "Missing required R2 environment variables"

**Solution:**
Ensure all R2 variables are set in `.env.local`:
```env
CLOUDFLARE_R2_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_key
CLOUDFLARE_R2_BUCKET_NAME=your_bucket_name
CLOUDFLARE_R2_PUBLIC_URL=https://your-bucket.r2.dev
```

### Problem: Files not uploading

**Check:**
1. R2 API credentials are correct
2. Bucket exists and is publicly accessible
3. Network connectivity to Cloudflare R2
4. File size limits (20MB for images, 50MB for documents)

## Dialog/Form Issues

### Problem: Form appears from the side or doesn't animate smoothly

**Solution:**
The dialog has been updated with custom CSS animations that:
- ✅ Appear smoothly in the center (no slide effects)
- ✅ Proper fade-in animation with scale effect
- ✅ Stay within viewport bounds (max-height: 80vh)
- ✅ Smooth scrolling for content
- ✅ Fixed header and footer

### Problem: Content not scrolling in dialog

**Solution:**
The dialog structure has been optimized:
- Header stays fixed at top
- Content area scrolls independently
- Footer stays fixed at bottom
- Proper padding restoration

## General Tips

1. **Always restart the dev server** after changing:
   - `next.config.js`
   - Environment variables
   - Middleware configuration

2. **Clear cache** if experiencing persistent issues:
   ```bash
   rm -rf .next
   rm -rf node_modules/.cache
   pnpm dev
   ```

3. **Check browser console** for detailed error messages

4. **Verify file permissions** in R2 bucket settings

5. **Test with small files first** to isolate size-related issues