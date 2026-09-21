const urlParams = new URLSearchParams(window.location.search);
let textoBusca = urlParams.get('texto') || '';
let modalidadeAtiva = '';
let posicaoAtiva = '';

const grid = document.getElementById('search-results-grid');
const infoEl = document.getElementById('busca-info');

init();

async function init() {
  await montarShellOpcional();
  ligarFiltros();
  ligarViewToggles();
  await executarBusca();
}

function ligarFiltros() {
  const containerMod = document.getElementById('filter-modalidade');
  const containerPos = document.getElementById('filter-posicao');
  const btnReset = document.getElementById('btn-reset-filtros');

  containerMod.addEventListener('click', (e) => {
    if (!e.target.classList.contains('filter-btn')) return;
    document.querySelectorAll('#filter-modalidade .filter-btn').forEach(b => b.classList.remove('active'));
    
    if (modalidadeAtiva === e.target.dataset.value) {
      modalidadeAtiva = ''; // Desmarca
    } else {
      e.target.classList.add('active');
      modalidadeAtiva = e.target.dataset.value;
    }
    executarBusca();
  });

  containerPos.addEventListener('click', (e) => {
    if (!e.target.classList.contains('filter-btn')) return;
    document.querySelectorAll('#filter-posicao .filter-btn').forEach(b => b.classList.remove('active'));
    
    if (posicaoAtiva === e.target.dataset.value) {
      posicaoAtiva = ''; 
    } else {
      e.target.classList.add('active');
      posicaoAtiva = e.target.dataset.value;
    }
    executarBusca();
  });

  btnReset.addEventListener('click', () => {
    modalidadeAtiva = '';
    posicaoAtiva = '';
    textoBusca = '';
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    const inputNav = document.getElementById('nav-search-input');
    if (inputNav) inputNav.value = '';
    window.history.replaceState({}, '', '/pesquisa');
    executarBusca();
  });
}

function ligarViewToggles() {
  const btnGrid = document.getElementById('btn-view-grid');
  const btnList = document.getElementById('btn-view-list');

  btnGrid.addEventListener('click', () => {
    grid.classList.remove('list-view');
    btnGrid.classList.add('active');
    btnList.classList.remove('active');
  });

  btnList.addEventListener('click', () => {
    grid.classList.add('list-view');
    btnList.classList.add('active');
    btnGrid.classList.remove('active');
  });
}

function calcularIdade(dataNascimento) {
  if (!dataNascimento) return "Idade não informada";
  const nasc = new Date(dataNascimento);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return `${idade} anos`;
}

async function executarBusca() {
  grid.innerHTML = `<div class="loading-row">A procurar...</div>`;
  infoEl.textContent = `A aplicar filtros...`;

  try {
    // Montar URL com filtros
    let params = new URLSearchParams();
    if (textoBusca) params.append("texto", textoBusca);
    if (modalidadeAtiva) params.append("modalidade", modalidadeAtiva);
    if (posicaoAtiva) params.append("posicao", posicaoAtiva);

    const res = await fetch(`/buscar?${params.toString()}`);
    if (!res.ok) throw new Error("Falha na pesquisa");
    const dados = await res.json();
    
    renderResultados(dados.usuarios, dados.times);
  } catch (e) {
    grid.innerHTML = `<div class="empty-state"><h3>Erro na pesquisa</h3><p>${escapeHTML(e.message)}</p></div>`;
  }
}

function renderResultados(atletas, times) {
  const total = atletas.length + times.length;
  
  if (total === 0) {
    infoEl.textContent = "Nenhum resultado encontrado.";
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <h3>Sem correspondências</h3>
        <p>Tente remover alguns filtros ou pesquisar por outro nome.</p>
      </div>`;
    return;
  }

  infoEl.textContent = `A exibir ${total} resultado(s)`;

  const htmlAtletas = atletas.map(a => `
    <article class="adv-card">
      <div class="adv-card-header">
        <a href="/perfil/usuario/${a.id}">${avatarHTML(a.nome, a.foto)}</a>
        <div class="adv-card-info">
          <a href="/perfil/usuario/${a.id}" class="name" style="display:block; color:inherit;">${escapeHTML(a.nome)}</a>
          <div class="specs">
            ${escapeHTML([a.modalidade, a.posicao].filter(Boolean).join(" · ") || "Atleta")}
          </div>
        </div>
      </div>
      <div class="adv-card-metrics">
        <div><span>Idade</span><strong>${calcularIdade(a.data_nascimento)}</strong></div>
        <div><span>Local</span><strong>${escapeHTML(a.estado || a.cidade || "Não informado")}</strong></div>
      </div>
      <div class="adv-card-actions">
        <a href="/perfil/usuario/${a.id}" class="btn btn-outline">Ver Perfil</a>
        <button class="btn btn-primary" onclick="alert('Funcionalidade de chat em desenvolvimento (Prioridade 6)')">Mensagem</button>
      </div>
    </article>
  `).join("");

  const htmlTimes = times.map(t => `
    <article class="adv-card">
      <div class="adv-card-header">
        <a href="/perfil/time/${t.id}">${avatarHTML(t.nome, t.escudo, { team: true })}</a>
        <div class="adv-card-info">
          <a href="/perfil/time/${t.id}" class="name" style="display:block; color:inherit;">${escapeHTML(t.nome)}</a>
          <div class="specs">Equipa Oficial</div>
        </div>
      </div>
      <div class="adv-card-metrics">
        <div><span>Base</span><strong>${escapeHTML([t.cidade, t.estado].filter(Boolean).join(" - ") || "Não informada")}</strong></div>
      </div>
      <div class="adv-card-actions">
        <a href="/perfil/time/${t.id}" class="btn btn-primary">Ver Plantel</a>
      </div>
    </article>
  `).join("");

  grid.innerHTML = htmlAtletas + htmlTimes;
}