// events.js
//
// Aqui ficam só os "ouvintes" de eventos (cliques, digitação, etc).
// Usamos delegação de eventos: em vez de colocar onclick="" em cada botão
// do HTML, escutamos os cliques no "body" inteiro e verificamos o que foi
// clicado através do atributo data-action.
//
// Isso evita repetir addEventListener para cada botão criado dinamicamente
// pelo render.js (ex: um botão "Seguir" dentro de um card criado depois).

import { qs, qsa } from './dom-utils.js';

/** Liga os eventos comuns a todas as páginas (curtir, salvar, seguir, etc) */
export function attachGlobalEvents() {
    document.body.addEventListener('click', (event) => {
        const actionButton = event.target.closest('[data-action]');
        if (!actionButton) return;

        switch (actionButton.dataset.action) {
            case 'like':
                toggleLike(actionButton);
                break;
            case 'save':
                toggleSave(actionButton);
                break;
            case 'follow':
                toggleFollow(actionButton);
                break;
            case 'training-save':
                toggleTrainingSave(actionButton);
                break;
            case 'compose-cancel':
                shrinkCompose();
                break;
            default:
                break;
        }
    });

    // Expande a caixa de nova postagem quando o usuário clica para escrever
    const composeTextarea = qs('.compose-textarea');
    if (composeTextarea) {
        composeTextarea.addEventListener('focus', () => expandCompose(composeTextarea));
    }
}

/** Liga a troca de abas do feed principal ("Para você", "Seguindo"...) */
export function attachFeedTabEvents() {
    const tabsContainer = qs('.feed-tabs');
    if (!tabsContainer) return;

    tabsContainer.addEventListener('click', (event) => {
        const tabButton = event.target.closest('.tab-btn');
        if (!tabButton) return;

        qsa('.tab-btn', tabsContainer).forEach((btn) => btn.classList.remove('active'));
        tabButton.classList.add('active');

        // TODO: quando a API existir, buscar os posts do tipo escolhido
        // (Para você / Seguindo / Times / Competições) e chamar renderFeedPosts()
    });
}

/**
 * Liga a troca de abas da página de Treinos.
 * @param {(tabId: string) => void} onTabChange chamado quando o usuário troca de aba
 */
export function attachTrainingTabEvents(onTabChange) {
    const tabsContainer = qs('.training-tabs');
    if (!tabsContainer) return;

    tabsContainer.addEventListener('click', (event) => {
        const tabButton = event.target.closest('.tab-btn');
        if (!tabButton) return;

        qsa('.tab-btn', tabsContainer).forEach((btn) => btn.classList.remove('active'));
        tabButton.classList.add('active');

        onTabChange(tabButton.dataset.tab);
    });
}

/**
 * Liga os filtros da página Explorar.
 * @param {(filters: {sport: string, level: string, location: string}) => void} onFilterChange
 */
export function attachExploreFilterEvents(onFilterChange) {
    const sportFilter = qs('#sport-filter');
    const levelFilter = qs('#level-filter');
    const locationFilter = qs('#location-filter');
    if (!sportFilter || !levelFilter || !locationFilter) return;

    function notifyChange() {
        onFilterChange({
            sport: sportFilter.value,
            level: levelFilter.value,
            location: locationFilter.value.trim(),
        });
    }

    sportFilter.addEventListener('change', notifyChange);
    levelFilter.addEventListener('change', notifyChange);

    // Só busca por localização depois que o usuário parar de digitar
    let debounceTimer;
    locationFilter.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(notifyChange, 400);
    });
}

/* ---------- Ações individuais (funções pequenas e específicas) ---------- */

function toggleLike(button) {
    const svgPath = button.querySelector('svg path');
    const countLabel = button.querySelector('[data-role="like-count"]');
    const wasLiked = button.classList.contains('liked');
    const currentCount = parseInt(countLabel.textContent.replace(/\D/g, ''), 10);

    button.classList.toggle('liked');
    countLabel.textContent = (wasLiked ? currentCount - 1 : currentCount + 1).toLocaleString('pt-BR');
    svgPath.setAttribute('fill', wasLiked ? 'none' : '#FF4D4D');
    svgPath.setAttribute('stroke', wasLiked ? 'currentColor' : '#FF4D4D');

    // TODO: enviar a curtida para a API (POST/DELETE /posts/:id/like)
}

function toggleSave(button) {
    const svgPath = button.querySelector('svg path');
    const wasSaved = button.classList.contains('saved');

    button.classList.toggle('saved');
    svgPath.setAttribute('fill', wasSaved ? 'none' : '#C8FF00');
    svgPath.setAttribute('stroke', wasSaved ? 'currentColor' : '#C8FF00');

    // TODO: salvar/remover o post na API
}

function toggleFollow(button) {
    const isFollowing = button.classList.contains('following');
    button.classList.toggle('following');
    button.textContent = isFollowing ? 'Seguir' : 'Seguindo';

    // TODO: enviar o "seguir"/"deixar de seguir" para a API
}

function toggleTrainingSave(button) {
    const svgPath = button.querySelector('svg path');
    const wasSaved = button.classList.contains('saved');

    button.classList.toggle('saved');
    svgPath.setAttribute('fill', wasSaved ? 'none' : '#C8FF00');
    svgPath.setAttribute('stroke', wasSaved ? 'currentColor' : '#C8FF00');

    // TODO: salvar/remover o treino na API
}

function expandCompose(textarea) {
    const actions = qs('#compose-actions');
    textarea.rows = 3;
    actions.classList.remove('hidden');
}

function shrinkCompose() {
    const textarea = qs('.compose-textarea');
    const actions = qs('#compose-actions');
    textarea.value = '';
    textarea.rows = 1;
    actions.classList.add('hidden');
}
