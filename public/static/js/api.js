/**
 * TheLocker - camada de acesso à API do backend Flask.
 * Cobre todas as rotas registradas nos blueprints: auth, postagens, busca,
 * perfil e times.
 */

const API = {
  async _request(path, options = {}) {
    const res = await fetch(path, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      ...options,
    });

    let data = null;
    try {
      data = await res.json();
    } catch (e) {
      data = null;
    }

    if (!res.ok) {
      const erro =
        (data && (data.erro || data.mensagem)) || `Erro ${res.status}`;
      const err = new Error(erro);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  },

  // ---- auth ----
  criarConta(payload) {
    return this._request("/criar-conta", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  login(payload) {
    return this._request("/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  usuarioAtual() {
    return this._request("/usuario");
  },

  // ---- postagens ----
  criarPostagem(payload) {
    return this._request("/postagem", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  listarPostagens() {
    return this._request("/postagens");
  },
  feedPostagens() {
    return this._request("/feed/postagens");
  },
  curtir(postagemId) {
    return this._request(`/postagem/${postagemId}/curtir`, { method: "POST" });
  },
  descurtir(postagemId) {
    return this._request(`/postagem/${postagemId}/curtir`, {
      method: "DELETE",
    });
  },
  comentar(postagemId, texto) {
    return this._request(`/postagem/${postagemId}/comentario`, {
      method: "POST",
      body: JSON.stringify({ texto }),
    });
  },
  comentarios(postagemId) {
    return this._request(`/postagem/${postagemId}/comentarios`);
  },
  // [Claudio] Novo: exclui uma postagem (só funciona se for do próprio usuário — validado no backend).
  deletarPostagem(postagemId) {
    return this._request(`/postagem/${postagemId}`, { method: "DELETE" });
  },

  // ---- busca ----
  buscar(texto) {
    return this._request(`/buscar?texto=${encodeURIComponent(texto)}`);
  },

  // ---- perfil (usuário logado) ----
  perfilDados() {
    return this._request("/perfil/dados");
  },
  perfilTimes() {
    return this._request("/perfil/times");
  },
  perfilSeguidores() {
    return this._request("/perfil/seguidores");
  },
  perfilSeguindo() {
    return this._request("/perfil/seguindo");
  },
  atualizarPerfil(payload) {
    return this._request("/perfil/config", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  // ---- perfil público ----
  perfilUsuarioDados(usuarioId) {
    return this._request(`/perfil/usuario/${usuarioId}/dados`);
  },
  perfilTimeDadosSimples(timeId) {
    return this._request(`/perfil/time/${timeId}/dados`);
  },
  seguir(usuarioId) {
    return this._request(`/perfil/seguir/${usuarioId}`, { method: "POST" });
  },
  deixarDeSeguir(usuarioId) {
    return this._request(`/perfil/seguir/${usuarioId}`, { method: "DELETE" });
  },
  verificarSeguindo(usuarioId) {
    return this._request(`/perfil/seguindo/${usuarioId}`);
  },
  seguidoresDe(usuarioId) {
    return this._request(`/perfil/${usuarioId}/seguidores`);
  },
  seguindoDe(usuarioId) {
    return this._request(`/perfil/${usuarioId}/seguindo`);
  },

  // ---- times ----
  criarTime(payload) {
    return this._request("/time", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  meuTime() {
    return this._request("/time/meu");
  },
  dadosTime(timeId) {
    return this._request(`/time/${timeId}`);
  },
  atualizarTime(timeId, payload) {
    return this._request(`/time/${timeId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  excluirTime(timeId) {
    return this._request(`/time/${timeId}`, { method: "DELETE" });
  },
  atletasDoTime(timeId) {
    return this._request(`/time/${timeId}/atletas`);
  },
  historicoDoTime(timeId) {
    return this._request(`/time/${timeId}/historico`);
  },
  adicionarAtletaAoTime(timeId, usuarioId) {
    return this._request(`/time/${timeId}/atleta`, {
      method: "POST",
      body: JSON.stringify({ usuario_id: usuarioId }),
    });
  },
  removerAtletaDoTime(timeId, atletaId) {
    return this._request(`/time/${timeId}/atleta/${atletaId}`, {
      method: "DELETE",
    });
  },
};

/** Helpers de UI compartilhados */

function iniciais(nome) {
  if (!nome) return "?";
  const partes = nome.trim().split(/\s+/);
  const first = partes[0]?.[0] || "";
  const last = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (first + last).toUpperCase();
}

function avatarHTML(nome, foto, opts = {}) {
  const { size = "", team = false } = opts;
  const cls = ["avatar", size, team ? "team" : ""].filter(Boolean).join(" ");
  if (foto) {
    return `<div class="${cls}"><img src="${escapeHTML(foto)}" alt="${escapeHTML(nome || "")}"></div>`;
  }
  return `<div class="${cls}">${iniciais(nome)}</div>`;
}

function escapeHTML(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function tempoRelativo(dataStr) {
  if (!dataStr) return "";
  const data = new Date(dataStr);
  if (isNaN(data.getTime())) return "";
  const diffMs = Date.now() - data.getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return data.toLocaleDateString("pt-BR");
}

function formatarData(dataStr, opts) {
  if (!dataStr) return "";
  const data = new Date(dataStr);
  if (isNaN(data.getTime())) return "";
  return data.toLocaleDateString(
    "pt-BR",
    opts || { month: "short", year: "numeric" },
  );
}

function tipoLabel(tipo) {
  const mapa = { atleta: "Atleta", recrutador: "Recrutador", time: "Time" };
  return mapa[tipo] || tipo || "";
}

/**
 * Garante que existe um usuário logado, redirecionando para /login caso não.
 */
async function exigirLogin() {
  try {
    return await API.usuarioAtual();
  } catch (e) {
    window.location.href = "/login";
    return null;
  }
}
