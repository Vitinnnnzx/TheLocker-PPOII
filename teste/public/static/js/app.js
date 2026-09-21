/* THE LOCKER — helpers compartilhados entre as páginas */

const Locker = {

  async api(url, method = "GET", body) {
    const opts = {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
    };
    if (body !== undefined) opts.body = JSON.stringify(body);

    const res = await fetch(url, opts);
    let data = null;
    try { data = await res.json(); } catch (e) { /* resposta sem corpo json (ex: 401 em HTML) */ }

    return { ok: res.ok, status: res.status, data: data || {} };
  },

  tipoLabel(tipo) {
    return { atleta: "Atleta", time: "Time", comum: "Torcedor" }[tipo] || tipo;
  },

  initials(nome) {
    if (!nome) return "?";
    const partes = nome.trim().split(/\s+/);
    const letras = partes.length > 1
      ? partes[0][0] + partes[partes.length - 1][0]
      : partes[0].slice(0, 2);
    return letras.toUpperCase();
  },

  timeAgo(isoString) {
    if (!isoString) return "";
    const diffMs = Date.now() - new Date(isoString).getTime();
    const min = Math.floor(diffMs / 60000);
    if (min < 1) return "agora";
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60);
    if (h < 24) return `${h} h`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d} d`;
    return new Date(isoString).toLocaleDateString("pt-BR");
  },

  escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
  },

  showMsg(el, text, kind = "error") {
    if (!el) return;
    el.textContent = text;
    el.className = "form-msg " + (kind === "error" ? "is-error" : "is-ok");
  },

  hideMsg(el) {
    if (!el) return;
    el.className = "form-msg";
  },

  /* Preenche a navbar com o nome/tipo do usuário logado e liga o botão sair. */
  async initNav() {
    const nameEl = document.querySelector("[data-nav-name]");
    const logoutBtn = document.querySelector("[data-logout]");
    const searchForm = document.querySelector("[data-search-form]");

    if (nameEl) {
      const { ok, data } = await this.api("/usuario");
      if (ok) nameEl.textContent = data.nome;
    }

    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => { location.href = "/logout"; });
    }

    if (searchForm) {
      searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const q = searchForm.querySelector("input").value.trim();
        if (q) location.href = "/buscar?texto=" + encodeURIComponent(q);
      });
    }
  },
};
