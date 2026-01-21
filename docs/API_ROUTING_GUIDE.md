# Astro + Cloudflare Pages Routing Guide

## 1. Why `getStaticPaths()` is required

In Astro, when you set `output: 'static'` (which is the default or explicitly set in your config), Astro attempts to build **every single page and endpoint** at build time to generate static HTML or JSON files.

For a dynamic route like `src/pages/products/[id].ts`:
- Astro needs to know exactly which `id`s exist (e.g., `id: '1'`, `id: '2'`) so it can generate `dist/products/1.html` or `dist/products/1.json`.
- It asks you to provide `getStaticPaths()` to return that list of IDs.
- If you don't provide it, Astro doesn't know what files to maintain, so it errors out.

**The `prerender = false` confusion:**
Even with `prerender = false`, if your global config is `output: 'static'`, Astro behaves primarily as a static site generator. To use dynamic server-side logic in `src/pages`, you typically need to switch your entire project to `output: 'server'` or `output: 'hybrid'` and use an **adapter** (like `@astrojs/cloudflare`).

---

## 2. API Routes vs. Page Routes

In Astro structure (`src/pages`):

- **Page Routes** (`.astro`, `.md`):
    - Return HTML.
    - Used for rendering UI.
- **Endpoint Routes** (`.ts`, `.js`):
    - Export HTTP method functions (`GET`, `POST`, `DELETE`, etc.).
    - Return `Response` objects (JSON, text, etc.).
    - Used for APIs.

Both follow the same build rules: if static, they must have known paths. If server/hybrid, they can interpret requests at runtime.

---

## 3. The Correct Location for Cloudflare Pages

When deploying to **Cloudflare Pages**, you have two main architecture choices. Your project uses **Option A** (Static + Functions), which is why `src/pages/api` failed but `functions/api` works.

### Option A: Static Site + Cloudflare Functions (Recommended for your current setup)
- **Config**: `output: 'static'`
- **UI**: Built statically from `src/pages`. Use `getStaticPaths` for dynamic UI pages.
- **API**: Placed in the **`/functions`** directory at the root of your project.
    - These are completely separate from Astro's build process.
    - They are auto-detected by Cloudflare.
    - No `getStaticPaths` needed because they handle wildcard requests naturally.

**File Structure:**
```
/
├── astro.config.mjs (output: 'static')
├── src/pages/        <-- Static UI (Home, Catalog)
└── functions/        <-- Dynamic API (Cloudflare syntax)
    └── api/
        └── products/
            └── [id].js  <-- Handles DELETE /api/products/123
```

### Option B: Astro SSR (Server Side Rendering)
- **Config**: `output: 'server'` or `'hybrid'`
- **Adapter**: Requires `@astrojs/cloudflare`.
- **UI & API**: All placed in `src/pages/`.
- **API**: `src/pages/api/products/[id].ts` works dynamically at runtime.

**File Structure:**
```
/
├── astro.config.mjs (output: 'server', adapter: cloudflare())
├── src/pages/
    ├── index.astro
    └── api/
        └── products/
            └── [id].ts  <-- Standard Astro Endpoint
```

---

## 4. Best Practices for CRUD (Astro + Cloudflare)

Since you are currently configured for **Static** output (Option A), stick to using the `functions/` directory for APIs. It keeps your frontend build fast (static) and your API logic dynamic (serverless).

### Working Code Example (Cloudflare Function)

**File:** `functions/api/products/[id].js`

```javascript
// Cloudflare Pages Function
// Handles requests to /api/products/:id

export async function onRequestDelete(context) {
  const { params, env } = context;
  const { id } = params;

  // 1. Validate Input
  if (!id) {
    return new Response(JSON.stringify({ error: "ID required" }), { 
      status: 400 
    });
  }

  // 2. Perform DB Operation (e.g., D1)
  // await env.DB.prepare('DELETE FROM products WHERE id = ?').bind(id).run();

  // 3. Return JSON Response
  return new Response(JSON.stringify({ 
    success: true, 
    message: `Product ${id} deleted` 
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
```

### Frontend Usage

**File:** `src/pages/admin/index.astro`

```javascript
// Frontend logic to call the API
async function deleteProduct(id) {
  const response = await fetch(`/api/products/${id}`, {
    method: 'DELETE'
  });
  
  if (response.ok) {
    // Remove UI element
  }
}
```
