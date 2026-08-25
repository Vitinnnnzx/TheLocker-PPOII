// render.js
//
// Aqui só existem funções que recebem dados já prontos e desenham (renderizam)
// eles na tela. Nenhuma função aqui busca dados (isso é papel do api.js) e
// nenhuma cuida de cliques (isso é papel do events.js).

import { qs, qsa, formatNumber, setColorVar } from './dom-utils.js';

/* ---------- Elementos comuns a todas as páginas ---------- */

/** Preenche o avatar do usuário logado no menu superior e na caixa de postagem */
export function renderCurrentUser(user) {
    document.querySelectorAll('.current-user-avatar').forEach((img) => {
        img.src = user.avatar;
        img.alt = user.name;
    });
}

/** Renderiza a lista "Meus Times" da barra lateral (presente em todas as páginas) */
export function renderTeams(teams) {
    const list = qs('#my-teams-list');
    if (!list) return;

    list.innerHTML = teams.map((team) => `
        <button class="team-item">
            <span class="team-dot" data-color="${team.color}"></span>
            <div class="team-info">
                <span class="team-name">${team.name}</span>
                <span class="team-sport">${team.sport}</span>
            </div>
        </button>
    `).join('');

    list.querySelectorAll('.team-dot').forEach((dot) => {
        setColorVar(dot, '--dot-color', dot.dataset.color);
    });
}

/* ---------- Feed (index.html) ---------- */

/** Renderiza a lista de stories no topo do feed, mantendo o botão fixo "Seu Story" */
export function renderStories(stories) {
    const container = qs('#stories-list');
    if (!container) return;

    const storiesHtml = stories.map((story) => `
        <div class="story-item">
            <div class="story-ring ${story.seen ? 'seen' : ''}">
                <img src="${story.avatar}" alt="${story.name}">
            </div>
            <span class="story-name">${story.name}</span>
        </div>
    `).join('');

    // Remove stories renderizados anteriormente (evita duplicar em recarregamentos)
    qsa('.story-item:not(.add-story)', container).forEach((el) => el.remove());
    container.insertAdjacentHTML('beforeend', storiesHtml);
}

/** Monta o HTML de um único post (usado tanto no feed quanto no perfil) */
function buildPostCard(post) {
    const hasStats = post.stats && Object.keys(post.stats).length > 0;

    const statsHtml = hasStats ? `
        <div class="post-stats">
            ${post.stats.distance ? `
                <div class="stat-pill">
                    <span class="stat-value stat-value--primary">${post.stats.distance}</span>
                    <span class="stat-label">km</span>
                </div>` : ''}
            ${post.stats.pace ? `
                <div class="stat-pill">
                    <span class="stat-value">${post.stats.pace}</span>
                    <span class="stat-label">min/km</span>
                </div>` : ''}
            ${post.stats.duration ? `
                <div class="stat-pill">
                    <span class="stat-value">${post.stats.duration}</span>
                    <span class="stat-label">tempo</span>
                </div>` : ''}
            ${post.stats.calories ? `
                <div class="stat-pill">
                    <span class="stat-value stat-value--accent">${post.stats.calories}</span>
                    <span class="stat-label">kcal</span>
                </div>` : ''}
        </div>
    ` : '';

    const imageHtml = post.image ? `
        <div class="post-image">
            <img src="${post.image}" alt="Imagem da postagem de ${post.author}">
        </div>
    ` : '';

    return `
        <article class="post-card" data-post-id="${post.id}">
            <div class="post-header">
                <div class="post-author-avatar">
                    <img src="${post.avatar}" alt="${post.author}">
                    <span class="sport-indicator" data-color="${post.sportColor}"></span>
                </div>
                <div class="post-meta">
                    <div class="author-row">
                        <span class="author-name">${post.author}</span>
                        <span class="sport-tag" data-color="${post.sportColor}">${post.sport}</span>
                    </div>
                    <div class="handle-row">
                        <span class="author-handle">@${post.handle}</span>
                        <span class="dot">·</span>
                        <span class="post-time">${post.time}</span>
                    </div>
                </div>
                <button class="more-btn" aria-label="Mais opções">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="4" r="1.2" fill="currentColor" />
                        <circle cx="8" cy="8" r="1.2" fill="currentColor" />
                        <circle cx="8" cy="12" r="1.2" fill="currentColor" />
                    </svg>
                </button>
            </div>
            <div class="post-content">
                <p>${post.content}</p>
            </div>
            ${statsHtml}
            ${imageHtml}
            <div class="post-actions">
                <button class="action-btn ${post.liked ? 'liked' : ''}" data-action="like">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="${post.liked ? '#FF4D4D' : 'none'}">
                        <path d="M8 13.5S2 9.5 2 5.5C2 3.57 3.57 2 5.5 2c1.05 0 2 .5 2.5 1.33C8.5 2.5 9.45 2 10.5 2 12.43 2 14 3.57 14 5.5c0 4-6 8-6 8Z" stroke="${post.liked ? '#FF4D4D' : 'currentColor'}" stroke-width="1.4" stroke-linejoin="round" />
                    </svg>
                    <span data-role="like-count">${formatNumber(post.likes)}</span>
                </button>
                <button class="action-btn" data-action="comment">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M2 3h12a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H5L2 15V4a1 1 0 0 1 1-1Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
                    </svg>
                    <span>${formatNumber(post.comments)}</span>
                </button>
                <button class="action-btn" data-action="share">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8L6 4M3 8l3 4M13 4v2a6 6 0 0 1-6 6H6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <span>${formatNumber(post.shares)}</span>
                </button>
                <div class="spacer"></div>
                <button class="action-btn" data-action="save">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 2h10a1 1 0 0 1 1 1v11l-6-3-6 3V3a1 1 0 0 1 1-1Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
                    </svg>
                </button>
            </div>
        </article>
    `;
}

/** Renderiza a lista de posts do feed principal */
export function renderFeedPosts(posts) {
    const container = qs('#posts-container');
    if (!container) return;
    container.innerHTML = posts.map(buildPostCard).join('');
    applySportColors(container);
}

/** Renderiza o card "Minha Semana" (estatísticas + gráfico) */
export function renderWeekStats(stats) {
    const grid = qs('#week-stats-grid');
    if (!grid) return;

    grid.innerHTML = `
        <div class="mini-stat-card">
            <span class="mini-stat-value mini-stat-value--primary">${stats.trainings}</span>
            <span class="mini-stat-label">Treinos</span>
        </div>
        <div class="mini-stat-card">
            <span class="mini-stat-value mini-stat-value--blue">${stats.km}<small>km</small></span>
            <span class="mini-stat-label">Km</span>
        </div>
        <div class="mini-stat-card">
            <span class="mini-stat-value">${stats.activeTime}<small>h</small></span>
            <span class="mini-stat-label">Tempo Ativo</span>
        </div>
        <div class="mini-stat-card">
            <span class="mini-stat-value mini-stat-value--red">${formatNumber(stats.kcal)}</span>
            <span class="mini-stat-label">Kcal</span>
        </div>
    `;

    renderActivityChart(stats.dailyActivity, '#week-activity-chart-bars', '#week-activity-chart-days');
}

/** Desenha o gráfico de barras de atividade diária (reaproveitado no feed e no perfil) */
function renderActivityChart(dailyActivity, barsSelector, daysSelector) {
    const bars = qs(barsSelector);
    const days = qs(daysSelector);
    if (!bars || !days) return;

    const todayIndex = 4; // Sexta-feira em destaque, mesma referência usada no protótipo original
    const weekDayLabels = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];

    bars.innerHTML = dailyActivity.map((value, index) => `
        <div class="bar ${index === todayIndex ? 'active' : ''}" style="height: ${value}%;"></div>
    `).join('');

    days.innerHTML = weekDayLabels.map((label, index) => `
        <span class="${index === todayIndex ? 'active' : ''}">${label}</span>
    `).join('');
}

/** Renderiza a lista de atletas sugeridos no painel direito do feed */
export function renderSuggestedAthletes(athletes) {
    const list = qs('#suggested-athletes-list');
    if (!list) return;

    list.innerHTML = athletes.map((athlete) => `
        <div class="athlete-item">
            <img src="${athlete.avatar}" alt="${athlete.name}">
            <div class="athlete-info">
                <div class="athlete-name-row">
                    <span class="athlete-name">${athlete.name}</span>
                    ${athlete.verified ? verifiedIconSvg() : ''}
                </div>
                <span class="athlete-meta">${athlete.sport} · ${athlete.followers} seguidores</span>
            </div>
            <button class="follow-btn" data-action="follow">Seguir</button>
        </div>
    `).join('');
}

/** Renderiza a lista de próximos eventos no painel direito do feed */
export function renderUpcomingEvents(events) {
    const list = qs('#upcoming-events-list');
    if (!list) return;

    list.innerHTML = events.map((event) => `
        <div class="event-item">
            <span class="event-dot" data-color="${event.color}"></span>
            <div class="event-info">
                <span class="event-name">${event.name}</span>
                <span class="event-meta">${event.sport} · ${formatNumber(event.participants)} participantes</span>
            </div>
            <span class="event-date" data-color="${event.color}">${event.date}</span>
        </div>
    `).join('');

    applySportColors(list);
}

/* ---------- Perfil do Atleta (profile.html) ---------- */

export function renderAthleteProfile(profile) {
    const avatar = qs('#profile-avatar');
    avatar.src = profile.avatar;
    avatar.alt = profile.name;

    setColorVar(qs('#profile-sport-indicator'), '--dot-color', profile.sportColor);
    qs('#profile-name').textContent = profile.name;
    qs('#profile-handle').textContent = `@${profile.handle}`;
    qs('#profile-sport').textContent = profile.sport;
    qs('#profile-followers').textContent = `${profile.followers} seguidores`;
    qs('#profile-following').textContent = `${profile.following} seguindo`;
    qs('#profile-bio').textContent = profile.bio;

    qs('#profile-verified-icon').classList.toggle('hidden', !profile.verified);

    const followBtn = qs('#profile-follow-btn');
    followBtn.textContent = 'Seguir';
    followBtn.classList.remove('following');
}

export function renderAthleteStats(stats) {
    const grid = qs('#athlete-stats-grid');
    if (!grid) return;

    grid.innerHTML = `
        <div class="mini-stat-card">
            <span class="mini-stat-value mini-stat-value--primary">${stats.trainings}</span>
            <span class="mini-stat-label">Treinos</span>
        </div>
        <div class="mini-stat-card">
            <span class="mini-stat-value mini-stat-value--blue">${stats.km}<small>km</small></span>
            <span class="mini-stat-label">Km</span>
        </div>
        <div class="mini-stat-card">
            <span class="mini-stat-value">${stats.activeTime}<small>h</small></span>
            <span class="mini-stat-label">Tempo Ativo</span>
        </div>
        <div class="mini-stat-card">
            <span class="mini-stat-value mini-stat-value--red">${formatNumber(stats.kcal)}</span>
            <span class="mini-stat-label">Kcal</span>
        </div>
    `;

    renderActivityChart(stats.dailyActivity, '#athlete-activity-chart-bars', '#athlete-activity-chart-days');
}

export function renderAthletePosts(posts) {
    const container = qs('#athlete-posts-container');
    if (!container) return;

    container.innerHTML = posts.map(buildPostCard).join('');
    applySportColors(container);
}

/* ---------- Explorar (explore.html) ---------- */

export function renderPopularAthletes(athletes) {
    const grid = qs('#athletes-grid');
    if (!grid) return;

    grid.innerHTML = athletes.map((athlete) => `
        <div class="athlete-card">
            <img src="${athlete.avatar}" alt="${athlete.name}" class="athlete-card-avatar">
            <p class="athlete-card-name">${athlete.name}</p>
            <p class="athlete-card-sport">${athlete.sport}</p>
            <p class="athlete-card-followers">${athlete.followers} seguidores</p>
            <button class="athlete-card-btn" data-action="follow">Seguir</button>
        </div>
    `).join('');
}

export function renderEventsExplore(events) {
    const list = qs('#events-list-explore');
    if (!list) return;

    list.innerHTML = events.map((event) => `
        <div class="event-card-explore">
            <span class="event-card-explore-dot" data-color="${event.color}"></span>
            <div class="event-card-explore-info">
                <p class="event-card-explore-name">${event.name}</p>
                <p class="event-card-explore-meta">${event.sport} · ${formatNumber(event.participants)} participantes</p>
            </div>
            <span class="event-card-explore-date" data-color="${event.color}">${event.date}</span>
        </div>
    `).join('');

    applySportColors(list);
}

export function renderTrendingTags(tags) {
    const container = qs('#trending-tags');
    if (!container) return;

    container.innerHTML = tags.map((item) => `
        <div class="trending-tag-pill">
            <span class="trending-tag-text">${item.tag}</span>
            <span class="trending-tag-count">${item.posts} posts</span>
        </div>
    `).join('');
}

/* ---------- Treinos (training.html) ---------- */

export function renderTrainings(trainings) {
    const grid = qs('#trainings-grid');
    const emptyState = qs('#empty-state');
    if (!grid) return;

    if (trainings.length === 0) {
        grid.innerHTML = '';
        emptyState?.classList.remove('hidden');
        return;
    }
    emptyState?.classList.add('hidden');

    grid.innerHTML = trainings.map((training) => `
        <div class="training-card">
            ${training.image
                ? `<img src="${training.image}" alt="${training.title}" class="training-card-image">`
                : `<div class="training-card-image training-card-image--placeholder" data-color="${training.sportColor}"></div>`}
            <div class="training-card-content">
                <p class="training-card-title">${training.title}</p>
                <div class="training-card-meta">
                    <span class="training-card-badge training-card-difficulty-${training.difficulty.toLowerCase()}">${training.difficulty}</span>
                    <span class="training-card-duration">${training.duration}</span>
                </div>
                <p class="training-card-description">${training.description}</p>
                <div class="training-card-author">
                    <img src="${training.authorAvatar}" alt="${training.author}" class="training-card-author-avatar">
                    <div class="training-card-author-info">
                        <p class="training-card-author-name">${training.author}</p>
                        <p class="training-card-author-handle">@${training.authorHandle}</p>
                    </div>
                    <button class="training-card-save-btn ${training.saved ? 'saved' : ''}" data-action="training-save">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="${training.saved ? '#C8FF00' : 'none'}">
                            <path d="M3 2h10a1 1 0 0 1 1 1v11l-6-3-6 3V3a1 1 0 0 1 1-1Z" stroke="${training.saved ? '#C8FF00' : 'currentColor'}" stroke-width="1.4" stroke-linejoin="round" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    grid.querySelectorAll('.training-card-image--placeholder').forEach((el) => {
        setColorVar(el, '--placeholder-color', el.dataset.color);
    });
}

/* ---------- Helpers internos ---------- */

function verifiedIconSvg() {
    return `<svg class="verified-icon" width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" fill="#3B82F6" /><path d="M3.5 6l1.5 1.5L8.5 4.5" stroke="white" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" /></svg>`;
}

/**
 * Converte todo atributo data-color="#hex" em uma variável CSS (--dot-color),
 * para que o style.css controle a aparência sem precisar de style="" no HTML.
 */
function applySportColors(scope) {
    scope.querySelectorAll('[data-color]').forEach((el) => {
        setColorVar(el, '--dot-color', el.dataset.color);
    });
}
