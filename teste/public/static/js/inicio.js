const composerAvatar = document.getElementById("composer-avatar");
const composerTexto = document.getElementById("composer-texto");
const composerImagem = document.getElementById("composer-imagem");
const composerBtn = document.getElementById("composer-btn");

let usuarioAtual = null;
let todasPostagens = [];
let idsQueSigo = new Set();

init();

async function init() {
  usuarioAtual = await montarShell("feed");
  if (!usuarioAtual) return;

  composerAvatar.innerHTML = avatarHTML(usuarioAtual.nome, usuarioAtual.foto, { team: usuarioAtual.tipo === "time" });
  composerBtn.addEventListener("click", publicar);

  ligarTabs();

  carregarRede();
  carregarSeguindo();
  carregarFeed();
}

function ligarTabs() {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(`tab-${tab.dataset.tab}`).classList.add("active");
    });
  });
}

async function carregarRede() {
  try {
    const [seguidores, seguindo] = await Promise.all([
      API.perfilSeguidores(),
      API.perfilSeguindo(),
    ]);

    document.getElementById("rede-stats").innerHTML = `
      <div class="stat-tile lime"><b>${seguidores.length}</b><span>Seguidores</span></div>
      <div class="stat-tile blue"><b>${seguindo.length}</b><span>Seguindo</span></div>
    `;

    const novosEl = document.getElementById("novos-seguidores");
    if (seguidores.length === 0) {
      novosEl.innerHTML = `<p style="font-size:12.5px; color:var(--text-dimmer); margin:0;">Ninguém te segue ainda.</p>`;
    } else {
      novosEl.innerHTML = seguidores.slice(0, 5).map((u) => `
        <a class="featured-row" href="/perfil/usuario/${u.id}">
          ${avatarHTML(u.nome, u.foto, { size: "sm" })}
          <div class="meta"><div class="n">${escapeHTML(u.nome)}</div></div>
        </a>
      `).join("");
    }
  } catch (e) {
    document.getElementById("rede-stats").innerHTML = `<div class="loading-row">Erro ao carregar.</div>`;
  }
}

async function carregarSeguindo() {
  const stripCard = document.getElementById("following-strip-card");
  const strip = document.getElementById("following-strip");

  try {
    const seguindo = await API.perfilSeguindo();
    idsQueSigo = new Set(seguindo.map((u) => u.id));

    if (seguindo.length === 0) {
      stripCard.style.display = "none";
      return;
    }

    stripCard.style.display = "block";
    strip.innerHTML = seguindo.map((u) => `
      <a class="avatar-strip-item" href="/perfil/usuario/${u.id}">
        <span class="avatar-ring">${avatarHTML(u.nome, u.foto)}</span>
        <span class="lbl">${escapeHTML(u.nome.split(" ")[0])}</span>
      </a>
    `).join("");

    if (todasPostagens.length > 0) renderTabSeguindo();
  } catch (e) {
    stripCard.style.display = "none";
  }
}

async function carregarFeed() {
  try {
    todasPostagens = await API.feedPostagens();
    renderTabVoce();
    renderTabSeguindo();
    renderTabTimes();
  } catch (e) {
    document.getElementById("feed-list-voce").innerHTML =
      `<div class="empty-state"><h3>Não foi possível carregar o feed</h3><p>${escapeHTML(e.message)}</p></div>`;
  }
}

function renderTabVoce() {
  renderPostList("feed-list-voce", "voce", todasPostagens, {
    emptyTitle: "Nenhuma publicação ainda",
    emptyText: "Seja o primeiro a compartilhar uma atualização.",
  });
}

function renderTabSeguindo() {
  const filtradas = todasPostagens.filter((p) => idsQueSigo.has(p.usuario.id));
  renderPostList("feed-list-seguindo", "seguindo", filtradas, {
    emptyTitle: "Nada por aqui ainda",
    emptyText: "Siga atletas e times para ver as publicações deles nesta aba.",
  });
}

function renderTabTimes() {
  const filtradas = todasPostagens.filter((p) => p.usuario.tipo === "time");
  renderPostList("feed-list-times", "times", filtradas, {
    emptyTitle: "Nenhum time publicou ainda",
    emptyText: "Publicações de contas de times aparecem aqui.",
  });
}

async function publicar() {
  const texto = composerTexto.value.trim();
  const imagem = composerImagem.value.trim();

  if (!texto && !imagem) return;

  composerBtn.disabled = true;
  composerBtn.textContent = "Publicando...";

  try {
    await API.criarPostagem({ texto, imagem: imagem || null });
    composerTexto.value = "";
    composerImagem.value = "";
    await carregarFeed();
  } catch (e) {
    alert(e.message || "Não foi possível publicar.");
  } finally {
    composerBtn.disabled = false;
    composerBtn.textContent = "Publicar";
  }
}
