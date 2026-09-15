const usuarioId = parseInt(document.body.dataset.usuarioId, 10);
const profileCard = document.getElementById("profile-card");
const loaded = { seguidores: false, seguindo: false };

let sessaoAtiva = null;
let euMesmo = false;

init();

async function init() {
  sessaoAtiva = await montarShellOpcional();
  euMesmo = !!(sessaoAtiva && sessaoAtiva.id === usuarioId);

  if (euMesmo) {
    window.location.href = "/perfil";
    return;
  }

  ligarTabs();
  carregarPerfil();
  carregarPostagens();
}

function ligarTabs() {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
      tab.classList.add("active");
      const nome = tab.dataset.tab;
      document.getElementById(`tab-${nome}`).classList.add("active");

      if (nome === "seguidores" && !loaded.seguidores) carregarSeguidores();
      if (nome === "seguindo" && !loaded.seguindo) carregarSeguindo();
    });
  });
}

async function carregarPerfil() {
  try {
    const dados = await API.perfilUsuarioDados(usuarioId);
    await renderPerfil(dados);
  } catch (e) {
    profileCard.innerHTML = `<div class="empty-state"><h3>Perfil não encontrado</h3><p>${escapeHTML(e.message)}</p></div>`;
  }
}

async function renderPerfil(dados) {
  let jaSegue = false;
  if (sessaoAtiva) {
    try {
      const r = await API.verificarSeguindo(usuarioId);
      jaSegue = !!r.seguindo;
    } catch (e) { /* mantém jaSegue = false */ }
  }

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
      ${sessaoAtiva
        ? `<button class="btn ${jaSegue ? "btn-outline" : "btn-primary"} btn-sm" id="follow-btn" data-following="${jaSegue}">${jaSegue ? "Seguindo" : "Seguir"}</button>`
        : `<a class="btn btn-primary btn-sm" href="/login">Entrar para seguir</a>`
      }
    </div>
    <div class="profile-body">
      ${dados.bio ? `<p class="profile-bio">${escapeHTML(dados.bio)}</p>` : ""}
      <div class="stat-grid cols-2">
        <div class="stat-tile blue"><b>${dados.seguidores ?? 0}</b><span>Seguidores</span></div>
        <div class="stat-tile orange"><b>${dados.seguindo ?? 0}</b><span>Seguindo</span></div>
      </div>
    </div>
  `;

  const followBtn = document.getElementById("follow-btn");
  if (followBtn) followBtn.addEventListener("click", () => toggleSeguir(followBtn));
}

async function toggleSeguir(btn) {
  const seguindo = btn.dataset.following === "true";
  btn.disabled = true;

  try {
    if (seguindo) {
      await API.deixarDeSeguir(usuarioId);
      btn.dataset.following = "false";
      btn.textContent = "Seguir";
      btn.classList.remove("btn-outline");
      btn.classList.add("btn-primary");
    } else {
      await API.seguir(usuarioId);
      btn.dataset.following = "true";
      btn.textContent = "Seguindo";
      btn.classList.remove("btn-primary");
      btn.classList.add("btn-outline");
    }
    loaded.seguidores = false;
    if (document.getElementById("tab-seguidores").classList.contains("active")) carregarSeguidores();
  } catch (e) {
    alert(e.message || "Não foi possível atualizar.");
  } finally {
    btn.disabled = false;
  }
}

async function carregarPostagens() {
  const el = document.getElementById("tab-postagens");
  try {
    let postagens;
    let interativo = false;

    if (sessaoAtiva) {
      const todas = await API.feedPostagens();
      postagens = todas.filter((p) => p.usuario.id === usuarioId);
      interativo = true;
    } else {
      const todas = await API.listarPostagens();
      postagens = todas.filter((p) => p.usuario.id === usuarioId);
    }

    renderPostList("tab-postagens", "perfilpub", postagens, {
      emptyTitle: "Nenhuma publicação ainda",
      emptyText: "",
      interativo,
    });
  } catch (e) {
    el.innerHTML = `<div class="loading-row">Erro ao carregar postagens.</div>`;
  }
}

async function carregarSeguidores() {
  const el = document.getElementById("tab-seguidores");
  try {
    const seguidores = await API.seguidoresDe(usuarioId);
    loaded.seguidores = true;
    el.innerHTML = renderListaUsuarios(seguidores, "Ninguém segue este perfil ainda.");
  } catch (e) {
    el.innerHTML = `<div class="loading-row">Erro ao carregar seguidores.</div>`;
  }
}

async function carregarSeguindo() {
  const el = document.getElementById("tab-seguindo");
  try {
    const seguindo = await API.seguindoDe(usuarioId);
    loaded.seguindo = true;
    el.innerHTML = renderListaUsuarios(seguindo, "Não segue ninguém ainda.");
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
