import authRoutes from "./routes/auth";

const PORT = 3000;

// Servidor principal
const server = Bun.serve({
  port: PORT,

  async fetch(req) {
    const url = new URL(req.url);
    const method = req.method;

    // Responde ao OPTIONS para evitar erro de CORS no frontend
    if (method === "OPTIONS") {
      return corsResponse();
    }

    // Rotas de autenticação
    if (url.pathname.startsWith("/auth")) {
      return authRoutes(req, url);
    }

    // Rota não encontrada
    return jsonResponse({ erro: "Rota não encontrada" }, 404);
  },
});

console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);

// Função auxiliar: retorna JSON com os headers necessários
export function jsonResponse(data: object, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

// Função auxiliar: resposta para requisições OPTIONS (CORS)
function corsResponse(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
