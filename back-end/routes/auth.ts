import { randomUUID } from "crypto";
import { Usuario, Perfil, Estatistica } from "src/database";
import { jsonResponse } from "../index";

// Essa função recebe a requisição e decide qual rota chamar
export async function authRoutes(req: Request, url: URL): Promise<Response> {
  const method = req.method;
  const path = url.pathname;

  // POST /auth/cadastro → cria um novo usuário
  if (method === "POST" && path === "/auth/cadastro") {
    return cadastrar(req);
  }

  // POST /auth/login → autentica o usuário
  if (method === "POST" && path === "/auth/login") {
    return login(req);
  }

  return jsonResponse({ erro: "Rota não encontrada" }, 404);
}

// ─── CADASTRO ────────────────────────────────────────────────────────────────

async function cadastrar(req: Request): Promise<Response> {
  const body = await req.json().catch(() => null);

  if (!body) {
    return jsonResponse({ erro: "Corpo da requisição inválido" }, 400);
  }

  const { nome_completo, email, senha, tipo_usuario, data_nascimento, cidade, estado } = body;

  // Validações básicas
  if (!nome_completo || !email || !senha || !tipo_usuario) {
    return jsonResponse({ erro: "Preencha todos os campos obrigatórios: nome_completo, email, senha, tipo_usuario" }, 400);
  }

  if (!["atleta", "recrutador", "admin"].includes(tipo_usuario)) {
    return jsonResponse({ erro: "tipo_usuario deve ser: atleta, recrutador ou admin" }, 400);
  }

  if (senha.length < 8) {
    return jsonResponse({ erro: "A senha deve ter no mínimo 8 caracteres" }, 400);
  }

  // Verifica se o e-mail já está cadastrado
  const usuarioExistente = Usuario.buscarPorEmail(email);
  if (usuarioExistente) {
    return jsonResponse({ erro: "Este e-mail já está cadastrado" }, 409);
  }

  // Cria o usuário
  const id = randomUUID();
  const senhaHash = await Bun.password.hash(senha);

  const usuario = Usuario.criar(
    id,
    nome_completo,
    email,
    senhaHash,
    tipo_usuario,
    data_nascimento ?? null,
    cidade ?? null,
    estado ?? null
  );

  // Se for atleta, cria o perfil e as estatísticas automaticamente
  if (tipo_usuario === "atleta") {
    const perfil = Perfil.criar(randomUUID(), usuario.id);
    Estatistica.criar(randomUUID(), perfil.id);
  }

  return jsonResponse({
    mensagem: "Usuário cadastrado com sucesso!",
    id_usuario: usuario.id,
  }, 201);
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────

async function login(req: Request): Promise<Response> {
  const body = await req.json().catch(() => null);

  if (!body) {
    return jsonResponse({ erro: "Corpo da requisição inválido" }, 400);
  }

  const { email, senha } = body;

  if (!email || !senha) {
    return jsonResponse({ erro: "Informe o e-mail e a senha" }, 400);
  }

  // Busca o usuário pelo e-mail
  const usuario = Usuario.buscarPorEmail(email);

  if (!usuario) {
    return jsonResponse({ erro: "E-mail ou senha incorretos" }, 401);
  }

  // Compara a senha digitada com o hash salvo no banco
  const senhaCorreta = await Bun.password.verify(senha, usuario.senha);

  if (!senhaCorreta) {
    return jsonResponse({ erro: "E-mail ou senha incorretos" }, 401);
  }

  // Por enquanto retornamos os dados do usuário
  // Em breve vamos adicionar o token JWT aqui
  return jsonResponse({
    mensagem: "Login realizado com sucesso!",
    usuario: {
      id_usuario: usuario.id,
      nome_completo: usuario.nomeCompleto,
      email: usuario.email,
      tipo_usuario: usuario.tipoUsuario,
    },
  });
}
