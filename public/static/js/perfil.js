const profileCard = document.getElementById("profile-card");
const loaded = { postagens: false, times: false, seguidores: false, seguindo: false };
let meusDados = null;
let minhasPostagens = [];

init();

async function init() {
  const usuario = await montarShell("perfil");
  if (!usuario) return;

  if (usuario.tipo === "time") {
    window.location.href = "/time-perfil";
    return;
  }

  ligarTabs();
  carregarPerfil(usuario);
}

function ligarTabs() {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
      tab.classList.add("active");
      const nome = tab.dataset.tab;
      document.getElementById(`tab-${nome}`).classList.add("active");

      if (nome === "times" && !loaded.times) carregarTimes();
      if (nome === "seguidores" && !loaded.seguidores) carregarSeguidores();
      if (nome === "seguindo" && !loaded.seguindo) carregarSeguindo();
    });
  });
}

async function carregarPerfil(usuarioSessao) {
  try {
    meusDados = await API.perfilDados();
    const [seguidores, seguindo] = await Promise.all([
      API.perfilSeguidores(),
      API.perfilSeguindo(),
    ]);

    renderPerfil(meusDados, seguidores.length, seguindo.length);
    carregarPostagens();
  } catch (e) {
    profileCard.innerHTML = `<div class="empty-state"><h3>Erro ao carregar perfil</h3><p>${escapeHTML(e.message)}</p></div>`;
  }
}

function renderPerfil(dados, totalSeguidores, totalSeguindo) {
  profileCard.innerHTML = `
    <div class="profile-header">
      ${avatarHTML(dados.nome, dados.foto, { size: "lg" })}
      <div class="details">
        <div class="tipo-badge">${escapeHTML(tipoLabel(dados.tipo))}</div>
        <h1>${escapeHTML(dados.nome)}</h1>
        <div class="profile-meta">
          ${dados.modalidade ? `<span><strong>${escapeHTML(dados.modalidade)}</strong></span>` : ""}
          ${dados.posicao ? `<span>${escapeHTML(dados.posicao)}</span>` : ""}
          ${(dados.cidade || dados.estado) ? `<span>${escapeHTML([dados.cidade, dados.estado].filter(Boolean).join(" · "))}</span>` : ""}
        </div>
      </div>
      <a class="btn btn-outline btn-sm" href="/config">${ICONS.pencil}Editar</a>
    </div>
    <div class="profile-body">
      ${dados.bio ? `<p class="profile-bio">${escapeHTML(dados.bio)}</p>` : `<p class="profile-bio" style="color:var(--text-dimmer);">Nenhuma bio ainda. <a href="/config" style="color:var(--accent);">Adicionar</a></p>`}
      <div class="stat-grid cols-3" style="margin-top:16px;">
        <div class="stat-tile lime"><b id="stat-postagens">—</b><span>Postagens</span></div>
        <div class="stat-tile blue"><b>${totalSeguidores}</b><span>Seguidores</span></div>
        <div class="stat-tile orange"><b>${totalSeguindo}</b><span>Seguindo</span></div>
      </div>
    </div>
  `;
}

async function carregarPostagens() {
  const el = document.getElementById("tab-postagens");
  try {
    const todas = await API.feedPostagens();
    minhasPostagens = todas.filter((p) => p.usuario.id === meusDados.id);
    loaded.postagens = true;

    atualizarContadorPostagens();
    desenharMinhasPostagens();
  } catch (e) {
    el.innerHTML = `<div class="loading-row">Erro ao carregar postagens.</div>`;
  }
}

// [Claudio] Extraído de dentro de carregarPostagens pra poder ser
// chamado de novo depois que uma postagem é excluída (evita repetir
// as mesmas opções de render em dois lugares diferentes).
function desenharMinhasPostagens() {
  renderPostList("tab-postagens", "meuperfil", minhasPostagens, {
    emptyTitle: "Você ainda não publicou nada",
    emptyText: "Vá até o feed e compartilhe sua primeira atualização.",
    usuarioAtualId: meusDados?.id,
    onDelete: (postagemId) => {
      minhasPostagens = minhasPostagens.filter((p) => p.id !== postagemId);
      atualizarContadorPostagens();
      desenharMinhasPostagens();
    },
  });
}

function atualizarContadorPostagens() {
  const statEl = document.getElementById("stat-postagens");
  if (statEl) statEl.textContent = minhasPostagens.length;
}

async function carregarTimes() {
  const el = document.getElementById("tab-times");
  try {
    const times = await API.perfilTimes();
    loaded.times = true;

    if (!times || times.length === 0) {
      el.innerHTML = `<div class="empty-state"><h3>Nenhum time ainda</h3><p>Times que você integra aparecerão aqui.</p></div>`;
      return;
    }

    el.innerHTML = times.map((t) => `
      <a class="team-card" href="/perfil/time/${t.id}" style="cursor:pointer;">
        ${avatarHTML(t.nome, t.escudo, { team: true })}
        <div class="info">
          <div class="n">${escapeHTML(t.nome)}</div>
          <div class="loc">${escapeHTML([t.cidade, t.estado].filter(Boolean).join(" · "))}</div>
        </div>
        <div class="period">${t.data_saida ? "Ex-atleta" : formatarData(t.data_entrada, { month: "short", year: "numeric" })}</div>
      </a>
    `).join("");
  } catch (e) {
    el.innerHTML = `<div class="loading-row">Erro ao carregar times.</div>`;
  }
}

async function carregarSeguidores() {
  const el = document.getElementById("tab-seguidores");
  try {
    const seguidores = await API.perfilSeguidores();
    loaded.seguidores = true;
    el.innerHTML = renderListaUsuarios(seguidores, "Ninguém te segue ainda.");
  } catch (e) {
    el.innerHTML = `<div class="loading-row">Erro ao carregar seguidores.</div>`;
  }
}

async function carregarSeguindo() {
  const el = document.getElementById("tab-seguindo");
  try {
    const seguindo = await API.perfilSeguindo();
    loaded.seguindo = true;
    el.innerHTML = renderListaUsuarios(seguindo, "Você ainda não segue ninguém.");
  } catch (e) {
    el.innerHTML = `<div class="loading-row">Erro ao carregar.</div>`;
  }
}

function renderListaUsuarios(usuarios, vazioTexto) {
  if (!usuarios || usuarios.length === 0) {
    return `<div class="empty-state"><h3>${escapeHTML(vazioTexto)}</h3></div>`;
  }
  return `<div class="card">` + usuarios.map((u) => `
    <a class="list-row" href="/perfil/usuario/${u.id}">
      ${avatarHTML(u.nome, u.foto, { size: "sm" })}
      <span class="name">${escapeHTML(u.nome)}</span>
    </a>
  `).join("") + `</div>`;
}
