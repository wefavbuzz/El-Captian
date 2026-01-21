/**
 * Cloudflare Pages Function: Products API
 * 
 * Route: /api/products/[[path]]
 * 
 * Handles all product CRUD operations:
 * - GET /api/products - List all products
 * - GET /api/products/:id - Get single product
 * - POST /api/products - Create product (requires auth)
 * - PUT /api/products/:id - Update product (requires auth)
 * - DELETE /api/products/:id - Delete product (requires auth)
 * 
 * Data Storage:
 * - Development: In-memory (demo purposes)
 * - Production: Cloudflare KV or D1
 * 
 * Authentication:
 * - Simple password-based for demo
 * - Production: Use Cloudflare Access or JWT
 */

// Initial sample data (in production, this comes from KV/D1)
const sampleProducts = [];


/**
 * CORS Headers for API responses
 */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/**
 * Helper: Create JSON response with CORS headers
 */
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

/**
 * Helper: Verify admin authorization
 * In production, use proper JWT or Cloudflare Access
 */
function isAuthorized(request) {
  const authHeader = request.headers.get('Authorization');
  // Demo: Accept 'Bearer admin123' as valid token
  return authHeader === 'Bearer admin123';
}

/**
 * Main request handler
 */
export async function onRequest(context) {
  const { request, env, params } = context;
  const method = request.method;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Parse path segments
  const pathSegments = params.path || [];
  const productId = pathSegments[0];

  try {
    // GET /api/products - List all products
    if (method === 'GET' && !productId) {
      // In production: const products = await env.PRODUCTS_KV.list();
      return jsonResponse({
        success: true,
        data: sampleProducts,
        count: sampleProducts.length,
      });
    }

    // GET /api/products/:id - Get single product
    if (method === 'GET' && productId) {
      // In production: const product = await env.PRODUCTS_KV.get(productId);
      const product = sampleProducts.find(p => p.id === productId);

      if (!product) {
        return jsonResponse({ success: false, error: 'Product not found' }, 404);
      }

      return jsonResponse({ success: true, data: product });
    }

    // POST /api/products - Create new product
    if (method === 'POST') {
      if (!isAuthorized(request)) {
        return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
      }

      const body = await request.json();

      // Validate required fields
      if (!body.name) {
        return jsonResponse({
          success: false,
          error: 'Name is required'
        }, 400);
      }

      const newProduct = {
        id: Date.now().toString(),
        name: body.name,
        nameAr: body.nameAr || '',
        description: body.description || '',
        image: body.image || '/images/placeholder.jpg',
        featured: body.featured || false,
        rating: body.rating || 0,
        platform: body.platform || ['PC'],
        createdAt: new Date().toISOString(),
      };

      // In production: await env.PRODUCTS_KV.put(newProduct.id, JSON.stringify(newProduct));

      return jsonResponse({
        success: true,
        data: newProduct,
        message: 'Product created successfully'
      }, 201);
    }

    // PUT /api/products/:id - Update product
    if (method === 'PUT' && productId) {
      if (!isAuthorized(request)) {
        return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
      }

      const body = await request.json();

      // In production: Get existing product from KV/D1
      const existingProduct = sampleProducts.find(p => p.id === productId);

      if (!existingProduct) {
        return jsonResponse({ success: false, error: 'Product not found' }, 404);
      }

      const updatedProduct = {
        ...existingProduct,
        ...body,
        id: productId, // Prevent ID modification
        updatedAt: new Date().toISOString(),
      };

      // In production: await env.PRODUCTS_KV.put(productId, JSON.stringify(updatedProduct));

      return jsonResponse({
        success: true,
        data: updatedProduct,
        message: 'Product updated successfully'
      });
    }

    // DELETE /api/products/:id - Delete product
    if (method === 'DELETE' && productId) {
      if (!isAuthorized(request)) {
        return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
      }

      console.log(`[API] Deleting product: ${productId}`);

      // Improve simulation: Actually remove from the in-memory array
      // Note: This only persists while the function's memory stays warm (dev/demo only)
      const index = sampleProducts.findIndex(p => p.id === productId);
      if (index !== -1) {
        sampleProducts.splice(index, 1);
      }

      // In production: await env.PRODUCTS_KV.delete(productId);

      return jsonResponse({
        success: true,
        message: 'Product deleted successfully',
        remaining: sampleProducts.length
      });
    }

    // Method not allowed
    return jsonResponse({ success: false, error: 'Method not allowed' }, 405);

  } catch (error) {
    console.error('API Error:', error);
    return jsonResponse({
      success: false,
      error: 'Internal server error'
    }, 500);
  }
}
