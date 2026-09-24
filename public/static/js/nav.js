async function montarShell(activePage) {
  const sidebarMount = document.getElementById("sidebar-mount");
  const topbarMount = document.getElementById("topbar-mount");
  if (!sidebarMount || !topbarMount) return null;

  let usuario;
  try {
    usuario = await API.usuarioAtual();
  } catch (e) {
    window.location.href = "/login";
    return null;
  }

  const ehTime = usuario.tipo === "time";
  const linkPerfil = ehTime ? "/time-perfil" : "/perfil";
  const labelPerfil = ehTime ? "Meu time" : "Meu perfil";
  const iconPerfil = ehTime ? ICONS.time : ICONS.perfil;

  sidebarMount.innerHTML = `
    <a class="brand" href="/">
        <img class="logo" src="/static/img/LogoTlocker.png" alt="teste" />
        THE LOCKER
    </a>
    <nav class="nav-links">
      <a class="nav-link ${activePage === "feed" ? "active" : ""}" href="/">
        ${ICONS.feed}<span>Feed</span>
      </a>
      <a class="nav-link ${activePage === "perfil" ? "active" : ""}" href="${linkPerfil}">
        ${iconPerfil}<span>${labelPerfil}</span>
      </a>
      <a class="nav-link ${activePage === "config" ? "active" : ""}" href="/config">
        ${ICONS.config}<span>Configurações</span>
      </a>
      <!-- Link para o CLIBS -->
      <a class="nav-link ${activePage === "clibs" ? "active" : ""}" href="/clibs">
        ${ICONS.comment}<span>CLIBS IA</span>
      </a>
    </nav>

    <button class="btn-post" id="btn-nova-postagem" type="button">
      ${ICONS.plus}<span>Nova postagem</span>
    </button>

    <div class="sidebar-section" id="sidebar-teams"></div>
  `;

  topbarMount.innerHTML = `
    <div class="search-box" id="nav-search-box">
      ${ICONS.search.replace("<svg ", '<svg class="icon" ')}
      <input type="text" id="nav-search-input" placeholder="Buscar atletas, times..." autocomplete="off">
      <div class="search-results" id="nav-search-results"></div>
    </div>
    <div class="topbar-spacer"></div>
    <div class="user-menu" id="user-menu">
      <button class="user-menu-trigger" id="user-menu-trigger" type="button">
        ${avatarHTML(usuario.nome, usuario.foto, { size: "sm", team: ehTime })}
        ${ICONS.chevronDown}
      </button>
      <div class="user-menu-dropdown" id="user-menu-dropdown">
        <div class="user-menu-head">
          ${avatarHTML(usuario.nome, usuario.foto, { size: "sm", team: ehTime })}
          <div>
            <div class="name">${escapeHTML(usuario.nome)}</div>
            <div class="tipo">${escapeHTML(tipoLabel(usuario.tipo))}</div>
          </div>
        </div>
        <a class="user-menu-item" href="${linkPerfil}">${iconPerfil}${labelPerfil}</a>
        <a class="user-menu-item" href="/config">${ICONS.config}Configurações</a>
        <a class="user-menu-item danger" href="/logout">${ICONS.logout}Sair</a>
      </div>
    </div>
  `;

  ligarBusca();
  ligarMenuUsuario();
  ligarBotaoNovaPostagem();

  if (!ehTime) {
    carregarMeusTimesNaSidebar();
  }

  return usuario;
}

async function montarShellOpcional() {
  const sidebarMount = document.getElementById("sidebar-mount");
  const topbarMount = document.getElementById("topbar-mount");
  if (!sidebarMount || !topbarMount) return null;

  try {
    const usuario = await API.usuarioAtual();
    await montarShell("");
    return usuario;
  } catch (e) {
    sidebarMount.innerHTML = `
      <a class="brand" href="/">       
        <img class="logo" src="static/img/LogoTlocker.png" alt="logo" />
        THE LOCKER
      </a>
      <div class="sidebar-section"></div>
      <a class="btn btn-primary btn-full" href="/login">Entrar</a>
    `;
    topbarMount.innerHTML = `
      <div class="search-box">
        ${ICONS.search.replace("<svg ", '<svg class="icon" ')}
        <input type="text" placeholder="Entre para buscar" disabled>
      </div>
      <div class="topbar-spacer"></div>
      <a class="btn btn-outline btn-sm" href="/login">Entrar</a>
    `;
    return null;
  }
}

async function carregarMeusTimesNaSidebar() {
  const el = document.getElementById("sidebar-teams");
  if (!el) return;

  try {
    const times = await API.perfilTimes();
    const ativos = (times || []).filter((t) => !t.data_saida);

    if (ativos.length === 0) {
      el.innerHTML = "";
      return;
    }

    const cores = [
      "var(--accent)",
      "var(--teal)",
      "var(--blue)",
      "var(--orange)",
      "var(--purple)",
    ];

    el.innerHTML = `
      <div class="sidebar-section-title">Meus times</div>
      ${ativos
        .map(
          (t, i) => `
        <a class="sidebar-team-row" href="/perfil/time/${t.id}">
          <span class="sidebar-team-dot" style="background:${cores[i % cores.length]}"></span>
          <div class="meta">
            <div class="n">${escapeHTML(t.nome)}</div>
          </div>
        </a>
      `,
        )
        .join("")}
    `;
  } catch (e) {
    el.innerHTML = "";
  }
}

function ligarMenuUsuario() {
  const trigger = document.getElementById("user-menu-trigger");
  const dropdown = document.getElementById("user-menu-dropdown");
  if (!trigger || !dropdown) return;

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("open");
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest("#user-menu")) {
      dropdown.classList.remove("open");
    }
  });
}

function ligarBotaoNovaPostagem() {
  const btn = document.getElementById("btn-nova-postagem");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const composer = document.getElementById("composer-texto");
    if (composer) {
      composer.focus();
      composer.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      window.location.href = "/";
    }
  });
}

function ligarBusca() {
  const input = document.getElementById("nav-search-input");
  const results = document.getElementById("nav-search-results");
  if (!input || !results) return;

  let timer = null;

  input.addEventListener("input", () => {
    const texto = input.value.trim();
    clearTimeout(timer);

    if (!texto) {
      results.classList.remove("open");
      results.innerHTML = "";
      return;
    }

    timer = setTimeout(async () => {
      try {
        const dados = await API.buscar(texto);
        renderResultadosBusca(dados);
      } catch (e) {
        results.innerHTML = `<div class="search-result-empty">Erro ao buscar.</div>`;
        results.classList.add("open");
      }
    }, 300);
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest("#nav-search-box")) {
      results.classList.remove("open");
    }
  });

  function renderResultadosBusca(dados) {
    // Contas do tipo "time" já aparecem (com o id correto) na lista de times;
    // evitamos duplicar/gerar link quebrado usando o usuario.id nesse caso.
    const usuarios = (dados.usuarios || []).filter((u) => u.tipo !== "time");
    const times = dados.times || [];

    if (usuarios.length === 0 && times.length === 0) {
      results.innerHTML = `<div class="search-result-empty">Nenhum resultado encontrado.</div>`;
      results.classList.add("open");
      return;
    }

    const itensUsuarios = usuarios
      .map(
        (u) => `
      <a class="search-result-item" href="/perfil/usuario/${u.id}">
        ${avatarHTML(u.nome, null, { size: "sm" })}
        <span>${escapeHTML(u.nome)}</span>
        <span class="tag">${escapeHTML(tipoLabel(u.tipo))}</span>
      </a>
    `,
      )
      .join("");

    const itensTimes = times
      .map(
        (t) => `
      <a class="search-result-item" href="/perfil/time/${t.id}">
        ${avatarHTML(t.nome, t.escudo, { size: "sm", team: true })}
        <span>${escapeHTML(t.nome)}</span>
        <span class="tag">Time</span>
      </a>
    `,
      )
      .join("");

    results.innerHTML = itensUsuarios + itensTimes;
    results.classList.add("open");
  }
}
