const timeId = parseInt(document.body.dataset.timeId, 10);
const teamCard = document.getElementById("team-card");
const loaded = { historico: false, seguidores: false };

let sessaoAtiva = null;
let timeDados = null;

init();

async function init() {
  sessaoAtiva = await montarShellOpcional();
  ligarTabs();
  carregarTime();
  carregarElenco();
}

function ligarTabs() {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
      tab.classList.add("active");
      const nome = tab.dataset.tab;
      document.getElementById(`tab-${nome}`).classList.add("active");

      if (nome === "historico" && !loaded.historico) carregarHistorico();
      if (nome === "seguidores" && !loaded.seguidores) carregarSeguidores();
    });
  });
}

async function carregarTime() {
  try {
    timeDados = await API.dadosTime(timeId);
    await renderTime();
  } catch (e) {
    teamCard.innerHTML = `<div class="empty-state"><h3>Time não encontrado</h3><p>${escapeHTML(e.message)}</p></div>`;
  }
}

async function renderTime() {
  const usuarioId = timeDados.usuario_id;
  const ehDono = !!(sessaoAtiva && sessaoAtiva.id === usuarioId);

  let jaSegue = false;
  if (sessaoAtiva && !ehDono) {
    try {
      const r = await API.verificarSeguindo(usuarioId);
      jaSegue = !!r.seguindo;
    } catch (e) { /* mantém false */ }
  }

  let acaoHTML = "";
  if (ehDono) {
    acaoHTML = `<a class="btn btn-outline btn-sm" href="/time-perfil">${ICONS.pencil}Gerenciar time</a>`;
  } else if (sessaoAtiva) {
    acaoHTML = `<button class="btn ${jaSegue ? "btn-outline" : "btn-primary"} btn-sm" id="follow-btn" data-following="${jaSegue}">${jaSegue ? "Seguindo" : "Seguir"}</button>`;
  } else {
    acaoHTML = `<a class="btn btn-primary btn-sm" href="/login">Entrar para seguir</a>`;
  }

  teamCard.innerHTML = `
    <div class="profile-header">
      ${avatarHTML(timeDados.nome, timeDados.escudo, { size: "lg", team: true })}
      <div class="details">
        <div class="tipo-badge">Time</div>
        <h1>${escapeHTML(timeDados.nome)}</h1>
        <div class="profile-meta">
          ${(timeDados.cidade || timeDados.estado) ? `<span>${escapeHTML([timeDados.cidade, timeDados.estado].filter(Boolean).join(" · "))}</span>` : ""}
          ${timeDados.data_criacao ? `<span>No TheLocker desde ${escapeHTML(formatarData(timeDados.data_criacao))}</span>` : ""}
        </div>
      </div>
      ${acaoHTML}
    </div>
  `;

  const followBtn = document.getElementById("follow-btn");
  if (followBtn) followBtn.addEventListener("click", () => toggleSeguir(followBtn, usuarioId));
}

async function toggleSeguir(btn, usuarioId) {
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

async function carregarElenco() {
  const el = document.getElementById("tab-elenco");
  try {
    const atletas = await API.atletasDoTime(timeId);

    if (!atletas || atletas.length === 0) {
      el.innerHTML = `<div class="empty-state"><h3>Elenco vazio</h3><p>Nenhum atleta vinculado a este time no momento.</p></div>`;
      return;
    }

    el.innerHTML = `<div class="card">` + atletas.map((a) => `
      <a class="list-row" href="/perfil/usuario/${a.usuario_id}">
        ${avatarHTML(a.nome, a.foto, { size: "sm" })}
        <span class="name">${escapeHTML(a.nome)}</span>
        <span class="sub">${escapeHTML([a.modalidade, a.posicao].filter(Boolean).join(" · "))}</span>
      </a>
    `).join("") + `</div>`;
  } catch (e) {
    el.innerHTML = `<div class="loading-row">Erro ao carregar elenco.</div>`;
  }
}

async function carregarHistorico() {
  const el = document.getElementById("tab-historico");
  try {
    const historico = await API.historicoDoTime(timeId);
    loaded.historico = true;

    if (!historico || historico.length === 0) {
      el.innerHTML = `<div class="empty-state"><h3>Sem histórico ainda</h3></div>`;
      return;
    }

    el.innerHTML = `<div class="card">` + historico.map((h) => `
      <div class="list-row">
        ${avatarHTML(h.nome, h.foto, { size: "sm" })}
        <span class="name">${escapeHTML(h.nome)}</span>
        <span class="sub">${formatarData(h.data_entrada)} ${h.data_saida ? `— ${formatarData(h.data_saida)}` : "— atualmente"}</span>
      </div>
    `).join("") + `</div>`;
  } catch (e) {
    el.innerHTML = `<div class="loading-row">Erro ao carregar histórico.</div>`;
  }
}

async function carregarSeguidores() {
  const el = document.getElementById("tab-seguidores");
  if (!timeDados) return;
  try {
    const seguidores = await API.seguidoresDe(timeDados.usuario_id);
    loaded.seguidores = true;

    if (!seguidores || seguidores.length === 0) {
      el.innerHTML = `<div class="empty-state"><h3>Ninguém segue este time ainda.</h3></div>`;
      return;
    }

    el.innerHTML = `<div class="card">` + seguidores.map((u) => `
      <a class="list-row" href="/perfil/usuario/${u.id}">
        ${avatarHTML(u.nome, u.foto, { size: "sm" })}
        <span class="name">${escapeHTML(u.nome)}</span>
      </a>
    `).join("") + `</div>`;
  } catch (e) {
    el.innerHTML = `<div class="loading-row">Erro ao carregar seguidores.</div>`;
  }
}
