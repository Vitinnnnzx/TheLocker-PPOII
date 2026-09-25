function renderPostList(containerId, prefix, postagens, options) {
  const container = document.getElementById(containerId);
  const opts = Object.assign(
    {
      emptyTitle: "Nenhuma publicação",
      emptyText: "",
      interativo: true,
      usuarioAtualId: null, // [Claudio] id do usuário logado — decide se mostra o botão de excluir
      onDelete: null, // [Claudio] callback(postagemId) chamado após excluir com sucesso
    },
    options,
  );

  if (!postagens || postagens.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>${escapeHTML(opts.emptyTitle)}</h3>
        ${opts.emptyText ? `<p>${escapeHTML(opts.emptyText)}</p>` : ""}
      </div>`;
    return;
  }

  container.innerHTML = postagens
    .map((p) => postCardHTML(p, prefix, opts.interativo, opts.usuarioAtualId))
    .join("");

  if (!opts.interativo) return;

  postagens.forEach((p) => {
    const card = document.getElementById(`${prefix}-post-${p.id}`);
    if (!card) return;

    const likeBtn = card.querySelector(".like-btn");
    if (likeBtn)
      likeBtn.addEventListener("click", () =>
        toggleCurtir(p.id, prefix, postagens),
      );

    const commentBtn = card.querySelector(".comment-toggle-btn");
    if (commentBtn)
      commentBtn.addEventListener("click", () =>
        toggleComentarios(p.id, prefix),
      );

    // [Claudio] Novo: botão de excluir postagem (só existe no HTML
    // quando a postagem é do próprio usuário — ver postCardHTML).
    const deleteBtn = card.querySelector(".post-delete-btn");
    if (deleteBtn)
      deleteBtn.addEventListener("click", () =>
        excluirPostagem(p.id, prefix, opts.onDelete),
      );

    const form = card.querySelector(".comment-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = form.querySelector("input");
        const texto = input.value.trim();
        if (!texto) return;
        enviarComentario(p.id, texto, input, prefix, postagens);
      });
    }
  });
}

function postCardHTML(p, prefix, interativo, usuarioAtualId) {
  const nome = p.usuario?.nome || "Usuário";
  const foto = p.usuario?.foto || null;
  const ehTime = p.usuario?.tipo === "time";
  const liked = !!p.curtiu;
  const temContadores = p.curtidas !== undefined;
  // [Claudio] Novo: só mostra a opção de excluir quando a postagem
  // é do próprio usuário logado E o card é interativo (feed/perfil
  // próprio). Em perfis públicos (interativo=false ou usuário de
  // outra conta) esse botão nunca é renderizado.
  const souDono =
    interativo && usuarioAtualId != null && p.usuario?.id === usuarioAtualId;

  return `
    <article class="post" id="${prefix}-post-${p.id}">
      <div class="post-head">
        <a href="/perfil/usuario/${p.usuario.id}">${avatarHTML(nome, foto, { team: ehTime })}</a>
        <div class="who">
          <div class="name-row">
            <a class="name" href="/perfil/usuario/${p.usuario.id}">${escapeHTML(nome)}</a>
            ${p.usuario.tipo ? `<span class="tag-pill ${ehTime ? "teal" : "blue"}">${escapeHTML(tipoLabel(p.usuario.tipo))}</span>` : ""}
          </div>
          <div class="time">${tempoRelativo(p.data_criacao)}</div>
        </div>
        ${
          souDono
            ? `
          <button
            class="post-delete-btn"
            type="button"
            title="Excluir postagem"
            aria-label="Excluir postagem"
          >${ICONS.trash}</button>
        `
            : ""
        }
      </div>

      ${p.texto ? `<p class="post-text">${escapeHTML(p.texto)}</p>` : ""}
      ${p.imagem ? `<div class="post-image"><img src="${escapeHTML(p.imagem)}" alt="Imagem da publicação" loading="lazy"></div>` : ""}

      ${
        temContadores
          ? `
        <div class="post-actions">
          ${
            interativo
              ? `
            <button class="post-action like-btn ${liked ? "liked" : ""}" data-liked="${liked}">
              ${liked ? ICONS.heartFilled : ICONS.heart}
              <span class="like-count">${p.curtidas ?? 0}</span>
            </button>
            <button class="post-action comment-toggle-btn">
              ${ICONS.comment}
              <span class="comment-count">${p.comentarios ?? 0}</span>
            </button>
          `
              : `
            <span class="post-action" style="cursor:default;">${ICONS.heart}<span>${p.curtidas ?? 0}</span></span>
            <span class="post-action" style="cursor:default;">${ICONS.comment}<span>${p.comentarios ?? 0}</span></span>
          `
          }
        </div>
        ${
          interativo
            ? `
          <div class="comments-panel" id="${prefix}-comments-${p.id}">
            <div class="comment-list"></div>
            <form class="comment-form">
              <input type="text" placeholder="Escreva um comentário..." maxlength="300">
              <button type="submit" class="btn btn-primary btn-sm">Enviar</button>
            </form>
          </div>
        `
            : ""
        }
      `
          : ""
      }
    </article>
  `;
}

async function toggleCurtir(postagemId, prefix, postagens) {
  const card = document.getElementById(`${prefix}-post-${postagemId}`);
  const btn = card.querySelector(".like-btn");
  const countEl = btn.querySelector(".like-count");
  const liked = btn.dataset.liked === "true";
  const count = parseInt(countEl.textContent, 10) || 0;

  btn.dataset.liked = String(!liked);
  btn.classList.toggle("liked", !liked);
  btn.innerHTML =
    (!liked ? ICONS.heartFilled : ICONS.heart) +
    `<span class="like-count">${liked ? count - 1 : count + 1}</span>`;

  try {
    if (liked) {
      await API.descurtir(postagemId);
    } else {
      await API.curtir(postagemId);
    }
    const p = postagens.find((x) => x.id === postagemId);
    if (p) {
      p.curtiu = !liked;
      p.curtidas = liked ? count - 1 : count + 1;
    }
  } catch (e) {
    btn.dataset.liked = String(liked);
    btn.classList.toggle("liked", liked);
    btn.innerHTML =
      (liked ? ICONS.heartFilled : ICONS.heart) +
      `<span class="like-count">${count}</span>`;
  }
}

// [Claudio] Nova função: exclui a postagem (com confirmação, igual ao
// padrão já usado em time.js para remover atleta do time).
async function excluirPostagem(postagemId, prefix, onDelete) {
  if (!confirm("Excluir esta postagem? Essa ação não pode ser desfeita.")) {
    return;
  }

  const card = document.getElementById(`${prefix}-post-${postagemId}`);
  const btn = card ? card.querySelector(".post-delete-btn") : null;

  if (btn) btn.disabled = true;
  if (card) card.style.opacity = "0.5";

  try {
    await API.deletarPostagem(postagemId);

    if (card) card.remove();

    // Avisa a página (feed/perfil) que a postagem sumiu, pra ela
    // atualizar a própria lista em memória e contadores (ex: "Postagens: 12").
    if (typeof onDelete === "function") onDelete(postagemId);
  } catch (e) {
    if (card) card.style.opacity = "";
    if (btn) btn.disabled = false;
    alert(e.message || "Não foi possível excluir a postagem.");
  }
}

async function toggleComentarios(postagemId, prefix) {
  const panel = document.getElementById(`${prefix}-comments-${postagemId}`);
  const abrindo = !panel.classList.contains("open");
  panel.classList.toggle("open");

  if (abrindo) {
    const list = panel.querySelector(".comment-list");
    list.innerHTML = `<div class="loading-row">Carregando comentários...</div>`;
    try {
      const comentarios = await API.comentarios(postagemId);
      renderComentarios(list, comentarios);
    } catch (e) {
      list.innerHTML = `<div class="loading-row">Erro ao carregar comentários.</div>`;
    }
  }
}

function renderComentarios(list, comentarios) {
  if (!comentarios || comentarios.length === 0) {
    list.innerHTML = `<div class="loading-row">Nenhum comentário ainda.</div>`;
    return;
  }
  list.innerHTML = comentarios
    .map(
      (c) => `
    <div class="comment-row">
      ${avatarHTML(c.usuario.nome, null, { size: "sm" })}
      <div class="bubble">
        <div class="name">${escapeHTML(c.usuario.nome)}</div>
        <div>${escapeHTML(c.texto)}</div>
      </div>
    </div>
  `,
    )
    .join("");
}

async function enviarComentario(postagemId, texto, input, prefix, postagens) {
  input.disabled = true;
  try {
    await API.comentar(postagemId, texto);
    input.value = "";

    const panel = document.getElementById(`${prefix}-comments-${postagemId}`);
    const list = panel.querySelector(".comment-list");
    const comentarios = await API.comentarios(postagemId);
    renderComentarios(list, comentarios);

    const card = document.getElementById(`${prefix}-post-${postagemId}`);
    card.querySelector(".comment-count").textContent = comentarios.length;

    const p = postagens.find((x) => x.id === postagemId);
    if (p) p.comentarios = comentarios.length;
  } catch (e) {
    alert(e.message || "Não foi possível comentar.");
  } finally {
    input.disabled = false;
  }
}
