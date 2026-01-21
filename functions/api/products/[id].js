export async function onRequestDelete(context) {
    const { params, env } = context;
    const { id } = params;

    if (!id) {
        return new Response(JSON.stringify({ error: "Product ID required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
        });
    }

    // Simulation of DB deletion (mock)
    // In a real scenario using D1:
    // await env.DB.prepare("DELETE FROM products WHERE id = ?").bind(id).run();

    return new Response(JSON.stringify({
        success: true,
        message: `Product ${id} deleted`
    }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });
}
