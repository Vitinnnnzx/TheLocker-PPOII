const urlParams = new URLSearchParams(window.location.search);
const textoBusca = urlParams.get('texto') || '';
const infoEl = document.getElementById('busca-info');

init();

async function init() {
  await montarShellOpcional();
  ligarTabs();

  if (!textoBusca) {
    infoEl.textContent = 'Nenhum termo de pesquisa inserido.';
    document.getElementById('lista-todos').innerHTML = `<div class="empty-state"><h3>Pesquisa vazia</h3><p>Introduza um nome para pesquisar.</p></div>`;
    return;
  }

  infoEl.textContent = `A mostrar resultados para "${escapeHTML(textoBusca)}"`;

  try {
    const dados = await API.buscar(textoBusca);
    renderResultados(dados);
  } catch (e) {
    document.getElementById('lista-todos').innerHTML = `<div class="empty-state"><h3>Erro na pesquisa</h3><p>${escapeHTML(e.message)}</p></div>`;
  }
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

function renderResultados(dados) {
  const usuarios = (dados.usuarios || []).filter(u => u.tipo !== "time");
  const times = dados.times || [];

  const renderCardUsuario = (u) => `
    <a class="list-row" href="/perfil/usuario/${u.id}">
      ${avatarHTML(u.nome, null, { size: "sm" })}
      <span class="name">${escapeHTML(u.nome)}</span>
      <span class="tag-pill blue" style="margin-left:auto;">${escapeHTML(tipoLabel(u.tipo))}</span>
    </a>
  `;

  const renderCardTime = (t) => `
    <a class="list-row" href="/perfil/time/${t.id}">
      ${avatarHTML(t.nome, t.escudo, { size: "sm", team: true })}
      <div class="name" style="flex:1; margin-left:10px;">
        <div style="font-weight:600; font-size:13.5px;">${escapeHTML(t.nome)}</div>
        <div style="font-size:11.5px; color:var(--text-dimmer);">${escapeHTML([t.cidade, t.estado].filter(Boolean).join(" · "))}</div>
      </div>
      <span class="tag-pill teal" style="margin-left:auto;">Equipa</span>
    </a>
  `;

  const htmlUsuarios = usuarios.length ? `<div class="card" style="display:flex; flex-direction:column;">${usuarios.map(renderCardUsuario).join("")}</div>` : `<div class="empty-state"><p>Nenhum utilizador encontrado.</p></div>`;
  const htmlTimes = times.length ? `<div class="card" style="display:flex; flex-direction:column;">${times.map(renderCardTime).join("")}</div>` : `<div class="empty-state"><p>Nenhuma equipa encontrada.</p></div>`;

  let htmlTodos = "";
  if (usuarios.length === 0 && times.length === 0) {
    htmlTodos = `<div class="empty-state"><h3>Sem resultados</h3><p>Não encontrámos nada para "${escapeHTML(textoBusca)}".</p></div>`;
  } else {
    htmlTodos = `<div class="card" style="display:flex; flex-direction:column;">` + 
                (usuarios.length ? usuarios.map(renderCardUsuario).join("") : "") + 
                (times.length ? times.map(renderCardTime).join("") : "") + 
                `</div>`;
  }

  document.getElementById('lista-todos').innerHTML = htmlTodos;
  document.getElementById('lista-atletas').innerHTML = htmlUsuarios;
  document.getElementById('lista-times').innerHTML = htmlTimes;
}