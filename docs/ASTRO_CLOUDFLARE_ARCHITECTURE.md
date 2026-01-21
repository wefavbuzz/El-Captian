# Astro + Cloudflare Pages: Clean/Correct Architecture

## 1. Core Concept
- **Static Frontend (`src/pages`)**: Use `output: 'static'` for maximum performance.
- **Serverless Backend (`functions/`)**: Use Cloudflare Pages Functions for dynamic APIs.
- **Strict Separation**: Never put backend logic in `src/pages` if you are using `output: 'static'`.

## 2. Recommended Folder Structure

```
/
├── astro.config.mjs          (output: 'static')
├── package.json              (scripts: "dev:wrangler": "wrangler pages dev ...")
├── src/
│   └── pages/                (ONLY UI files)
│       └── admin.astro       (Admin Dashboard)
└── functions/
    └── api/
        └── products/
            └── [[path]].js   (Single file handling ALL /api/products/* routes)
```

## 3. The `[[path]].js` Pattern
Instead of managing multiple files like `index.js`, `[id].js`, `create.js`, use a single Catch-All route.
This avoids routing conflicts and "getStaticPaths" errors.

## 4. Common Pitfalls & Solutions

### Error: "getStaticPaths() required"
- **Cause**: Putting a `[id].ts` file in `src/pages` while `output: 'static'`.
- **Fix**: Move that logic to `functions/api/...`.

### Error: "404 Not Found" on API routes locally
- **Cause**: Running `npm run dev` (Astro only).
- **Fix**: Run `npx wrangler pages dev . --astro`.

### Error: "401 Unauthorized"
- **Cause**: Backend checks header, Frontend forgets to send it.
- **Fix**: Always include `Authorization: Bearer ...` in `fetch`.

## 5. End-to-End Example (DELETE)

### Backend (`functions/api/products/[[path]].js`)
```javascript
export async function onRequest(context) {
  const { request, params } = context;
  
  // 1. Route Check
  if (request.method === 'DELETE') {
    // 2. Auth Check
    if (request.headers.get('Authorization') !== 'Bearer token') {
      return new Response('Unauthorized', { status: 401 });
    }
    
    // 3. Logic
    const id = params.path[0];
    // perform DB delete...
    
    // 4. Response
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
```

### Frontend (`src/pages/admin.astro`)
```javascript
await fetch(`/api/products/${id}`, {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer token' // Critical!
  }
});
```
