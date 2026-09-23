carregarFeedPublico();

async function carregarFeedPublico() {
  const section = document.getElementById("landing-feed-section");
  const list = document.getElementById("landing-feed-list");

  try {
    const postagens = "";

    if (!postagens || postagens.length === 0) {
      return; // sem postagens ainda: não mostra a seção
    }

    section.style.display = "block";

    list.innerHTML = postagens
      .slice(0, 4)
      .map(
        (p) => `
      <article class="post">
        <div class="post-head">
          ${avatarHTML(p.usuario.nome, p.usuario.foto, { team: p.usuario.tipo === "time" })}
          <div class="who">
            <div class="name-row">
              <span class="name">${escapeHTML(p.usuario.nome)}</span>
              <span class="tag-pill ${p.usuario.tipo === "time" ? "teal" : ""}">${escapeHTML(tipoLabel(p.usuario.tipo))}</span>
            </div>
            <div class="time">${tempoRelativo(p.data_criacao)}</div>
          </div>
        </div>
        ${p.texto ? `<p class="post-text">${escapeHTML(p.texto)}</p>` : ""}
        ${p.imagem ? `<div class="post-image"><img src="${escapeHTML(p.imagem)}" alt="" loading="lazy"></div>` : ""}
      </article>
    `,
      )
      .join("");
  } catch (e) {
    // silencioso: a landing funciona normalmente sem a prévia do feed
  }
}
