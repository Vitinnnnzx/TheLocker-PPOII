const conteudo = document.getElementById("time-conteudo");
let timeId = null;
let timeDados = null;
let elencoAtual = [];
const loaded = { historico: false };

init();

async function init() {
  const usuario = await montarShell("perfil");
  if (!usuario) return;

  try {
    const meu = await API.meuTime();
    timeId = meu.time_id;
  } catch (e) {
    renderNaoETime();
    return;
  }

  await carregarTudo();
}

function renderNaoETime() {
  conteudo.innerHTML = `
    <div class="empty-state">
      ${ICONS.shield}
      <h3>Esta conta não é um time</h3>
      <p>A página de gestão de elenco é exclusiva para contas de time.</p>
      <a class="btn btn-primary" style="margin-top:16px;" href="/">Voltar ao feed</a>
    </div>
  `;
}

async function carregarTudo() {
  try {
    const [dados, atletas] = await Promise.all([
      API.dadosTime(timeId),
      API.atletasDoTime(timeId),
    ]);
    timeDados = dados;
    elencoAtual = atletas;
    renderPagina();
  } catch (e) {
    conteudo.innerHTML = `<div class="empty-state"><h3>Erro ao carregar o time</h3><p>${escapeHTML(e.message)}</p></div>`;
  }
}

function renderPagina() {
  conteudo.innerHTML = `
    <div class="profile-cover"></div>
    <div class="card profile-card">
      <div class="profile-header">
        ${avatarHTML(timeDados.nome, timeDados.escudo, { size: "lg", team: true })}
        <div class="details">
          <div class="tipo-badge">Time</div>
          <h1>${escapeHTML(timeDados.nome)}</h1>
          <div class="profile-meta">
            ${(timeDados.cidade || timeDados.estado) ? `<span>${escapeHTML([timeDados.cidade, timeDados.estado].filter(Boolean).join(" · "))}</span>` : ""}
            <span>${escapeHTML(timeDados.email || "")}</span>
            ${timeDados.data_criacao ? `<span>No TheLocker desde ${escapeHTML(formatarData(timeDados.data_criacao))}</span>` : ""}
          </div>
        </div>
      </div>
      <div class="profile-body">
        <div class="stat-grid cols-2">
          <div class="stat-tile lime"><b>${elencoAtual.length}</b><span>Atletas no elenco</span></div>
          <div class="stat-tile blue"><b id="stat-visualizar"><a href="/perfil/time/${timeId}" style="color:inherit;">Ver perfil público →</a></b><span>Como outros veem</span></div>
        </div>
      </div>
    </div>

    <div class="tab-row">
      <button class="tab active" data-tab="elenco">Elenco atual</button>
      <button class="tab" data-tab="historico">Histórico</button>
      <button class="tab" data-tab="editar">Editar dados</button>
      <button class="tab" data-tab="perigo">Zona de risco</button>
    </div>

    <div class="tab-panel active" id="tab-elenco"></div>
    <div class="tab-panel" id="tab-historico"><div class="loading-row">Carregando histórico...</div></div>
    <div class="tab-panel" id="tab-editar"></div>
    <div class="tab-panel" id="tab-perigo"></div>
  `;

  ligarTabs();
  renderElenco();
  renderEditar();
  renderPerigo();
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
    });
  });
}

function renderElenco() {
  const el = document.getElementById("tab-elenco");

  el.innerHTML = `
    <div class="card">
      <p class="card-title">Adicionar atleta</p>
      <div class="search-box" id="add-atleta-search-box">
        ${ICONS.search.replace("<svg ", '<svg class="icon" ')}
        <input type="text" id="add-atleta-input" placeholder="Buscar atleta pelo nome..." autocomplete="off">
        <div class="search-results" id="add-atleta-results"></div>
      </div>
    </div>
    <div id="elenco-lista"></div>
  `;

  ligarBuscaAdicionar();
  renderListaElenco();
}

function renderListaElenco() {
  const lista = document.getElementById("elenco-lista");

  if (elencoAtual.length === 0) {
    lista.innerHTML = `
      <div class="empty-state">
        ${ICONS.users}
        <h3>Elenco vazio</h3>
        <p>Use a busca acima para adicionar atletas ao time.</p>
      </div>`;
    return;
  }

  lista.innerHTML = elencoAtual.map((a) => `
    <div class="team-card">
      ${avatarHTML(a.nome, a.foto)}
      <div class="info">
        <a class="n" href="/perfil/usuario/${a.usuario_id}">${escapeHTML(a.nome)}</a>
        <div class="loc">${escapeHTML([a.modalidade, a.posicao].filter(Boolean).join(" · ") || "—")}</div>
      </div>
      <div class="period">desde ${formatarData(a.data_entrada)}</div>
      <button class="btn btn-danger btn-sm" data-atleta-id="${a.atleta_id}" title="Remover do time">${ICONS.trash}</button>
    </div>
  `).join("");

  lista.querySelectorAll("button[data-atleta-id]").forEach((btn) => {
    btn.addEventListener("click", () => removerAtleta(parseInt(btn.dataset.atletaId, 10)));
  });
}

function ligarBuscaAdicionar() {
  const input = document.getElementById("add-atleta-input");
  const results = document.getElementById("add-atleta-results");
  let timer = null;

  input.addEventListener("input", () => {
    clearTimeout(timer);
    const texto = input.value.trim();
    if (!texto) {
      results.classList.remove("open");
      return;
    }
    timer = setTimeout(async () => {
      try {
        const dados = await API.buscar(texto);
        const candidatos = (dados.usuarios || []).filter((u) => u.tipo === "atleta");

        if (candidatos.length === 0) {
          results.innerHTML = `<div class="search-result-empty">Nenhum atleta encontrado.</div>`;
        } else {
          results.innerHTML = candidatos.map((u) => `
            <div class="search-result-item" data-usuario-id="${u.id}" data-nome="${escapeHTML(u.nome)}">
              ${avatarHTML(u.nome, null, { size: "sm" })}
              <span>${escapeHTML(u.nome)}</span>
              <span class="tag">Adicionar</span>
            </div>
          `).join("");

          results.querySelectorAll("[data-usuario-id]").forEach((item) => {
            item.addEventListener("click", () => {
              adicionarAtleta(parseInt(item.dataset.usuarioId, 10));
              results.classList.remove("open");
              input.value = "";
            });
          });
        }
        results.classList.add("open");
      } catch (e) {
        results.innerHTML = `<div class="search-result-empty">Erro ao buscar.</div>`;
        results.classList.add("open");
      }
    }, 300);
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest("#add-atleta-search-box")) results.classList.remove("open");
  });
}

async function adicionarAtleta(usuarioId) {
  try {
    await API.adicionarAtletaAoTime(timeId, usuarioId);
    elencoAtual = await API.atletasDoTime(timeId);
    renderListaElenco();
  } catch (e) {
    alert(e.message || "Não foi possível adicionar o atleta.");
  }
}

async function removerAtleta(atletaId) {
  if (!confirm("Remover este atleta do time?")) return;
  try {
    await API.removerAtletaDoTime(timeId, atletaId);
    elencoAtual = await API.atletasDoTime(timeId);
    renderListaElenco();
  } catch (e) {
    alert(e.message || "Não foi possível remover o atleta.");
  }
}

async function carregarHistorico() {
  const el = document.getElementById("tab-historico");
  try {
    const historico = await API.historicoDoTime(timeId);
    loaded.historico = true;

    if (!historico || historico.length === 0) {
      el.innerHTML = `<div class="empty-state"><h3>Sem histórico ainda</h3><p>Entradas e saídas de atletas aparecerão aqui.</p></div>`;
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

function renderEditar() {
  const el = document.getElementById("tab-editar");
  el.innerHTML = `
    <div class="form-error" id="editar-error"></div>
    <div class="form-success" id="editar-success"></div>
    <div class="card">
      <form id="editar-form">
        <div class="field">
          <label for="e-nome">Nome do time</label>
          <input type="text" id="e-nome" value="${escapeHTML(timeDados.nome || "")}">
        </div>
        <div class="field">
          <label for="e-email">E-mail</label>
          <input type="email" id="e-email" value="${escapeHTML(timeDados.email || "")}">
        </div>
        <div class="field-row">
          <div class="field">
            <label for="e-cidade">Cidade</label>
            <input type="text" id="e-cidade" value="${escapeHTML(timeDados.cidade || "")}">
          </div>
          <div class="field" style="max-width:100px;">
            <label for="e-estado">UF</label>
            <input type="text" id="e-estado" maxlength="2" style="text-transform:uppercase;" value="${escapeHTML(timeDados.estado || "")}">
          </div>
        </div>
        <div class="field">
          <label for="e-escudo">URL do escudo</label>
          <input type="text" id="e-escudo" value="${escapeHTML(timeDados.escudo || "")}">
        </div>
        <button type="submit" class="btn btn-primary" id="editar-submit-btn">Salvar alterações</button>
      </form>
    </div>
  `;

  document.getElementById("editar-form").addEventListener("submit", salvarEdicao);
}

async function salvarEdicao(e) {
  e.preventDefault();
  const errorBox = document.getElementById("editar-error");
  const successBox = document.getElementById("editar-success");
  const btn = document.getElementById("editar-submit-btn");
  errorBox.classList.remove("visible");
  successBox.classList.remove("visible");
  btn.disabled = true;
  btn.textContent = "Salvando...";

  try {
    await API.atualizarTime(timeId, {
      nome: document.getElementById("e-nome").value.trim() || null,
      email: document.getElementById("e-email").value.trim() || null,
      cidade: document.getElementById("e-cidade").value.trim() || null,
      estado: document.getElementById("e-estado").value.trim().toUpperCase() || null,
      escudo: document.getElementById("e-escudo").value.trim() || null,
    });
    successBox.textContent = "Dados do time atualizados!";
    successBox.classList.add("visible");
    await carregarTudo();
    document.querySelector('.tab[data-tab="editar"]').click();
  } catch (err) {
    errorBox.textContent = err.message || "Não foi possível salvar.";
    errorBox.classList.add("visible");
    btn.disabled = false;
    btn.textContent = "Salvar alterações";
  }
}

function renderPerigo() {
  const el = document.getElementById("tab-perigo");
  el.innerHTML = `
    <div class="card danger-zone">
      <p class="card-title">Excluir time</p>
      <div class="danger-row">
        <p>Isso apaga a conta do time e não pode ser desfeito.</p>
        <button class="btn btn-danger btn-sm" id="btn-abrir-exclusao">${ICONS.trash} Excluir time</button>
      </div>
    </div>
  `;

  document.getElementById("btn-abrir-exclusao").addEventListener("click", () => {
    document.getElementById("modal-excluir").classList.add("open");
  });
}

document.getElementById("cancelar-exclusao").addEventListener("click", () => {
  document.getElementById("modal-excluir").classList.remove("open");
});

document.getElementById("confirmar-exclusao").addEventListener("click", async () => {
  const btn = document.getElementById("confirmar-exclusao");
  btn.disabled = true;
  btn.textContent = "Excluindo...";
  try {
    await API.excluirTime(timeId);
    window.location.href = "/logout";
  } catch (e) {
    alert(e.message || "Não foi possível excluir o time.");
    btn.disabled = false;
    btn.textContent = "Excluir definitivamente";
  }
});
