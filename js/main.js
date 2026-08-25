// main.js
//
// Ponto de entrada da aplicação. Ele decide, com base na página atual
// (atributo data-page do <body>), quais dados buscar (api.js) e quais
// funções de renderização chamar (render.js). Também liga os eventos
// (events.js) depois que o conteúdo já está na tela.

import * as api from './api.js';
import * as render from './render.js';
import * as events from './events.js';
import { qs } from './dom-utils.js';

document.addEventListener('DOMContentLoaded', () => {
    initCurrentPageNavLink();
    initSharedSections();
    events.attachGlobalEvents();

    const page = document.body.dataset.page;

    if (page === 'feed') initFeedPage();
    if (page === 'profile') initProfilePage();
    if (page === 'explore') initExplorePage();
    if (page === 'training') initTrainingPage();
});

/** Marca no menu lateral qual é a página atual (sem depender de clique/JS por navegação) */
function initCurrentPageNavLink() {
    const currentPage = document.body.dataset.page;
    document.querySelectorAll('.nav-item').forEach((link) => {
        link.classList.toggle('active', link.dataset.id === currentPage);
    });
}

/** Carrega dados presentes em todas as páginas: avatar do usuário e "Meus Times" */
async function initSharedSections() {
    const [user, teams] = await Promise.all([
        api.fetchCurrentUser(),
        api.fetchMyTeams(),
    ]);
    render.renderCurrentUser(user);
    render.renderTeams(teams);
}

async function initFeedPage() {
    events.attachFeedTabEvents();

    const [stories, posts, weekStats, suggestedAthletes, upcomingEvents] = await Promise.all([
        api.fetchStories(),
        api.fetchFeedPosts(),
        api.fetchWeekStats(),
        api.fetchSuggestedAthletes(),
        api.fetchUpcomingEvents(),
    ]);

    render.renderStories(stories);
    render.renderFeedPosts(posts);
    render.renderWeekStats(weekStats);
    render.renderSuggestedAthletes(suggestedAthletes);
    render.renderUpcomingEvents(upcomingEvents);
}

async function initProfilePage() {
    // Por enquanto sempre carrega o perfil do usuário de exemplo.
    // TODO: pegar o id do atleta pela URL (ex: profile.html?id=123) quando
    // a página passar a exibir perfis de outros atletas também.
    const athleteId = new URLSearchParams(window.location.search).get('id') ?? 'me';

    const [profile, stats, posts] = await Promise.all([
        api.fetchAthleteProfile(athleteId),
        api.fetchAthleteStats(athleteId),
        api.fetchAthletePosts(athleteId),
    ]);

    render.renderAthleteProfile(profile);
    render.renderAthleteStats(stats);
    render.renderAthletePosts(posts);
}

async function initExplorePage() {
    events.attachExploreFilterEvents(async (filters) => {
        const athletes = await api.fetchPopularAthletes(filters);
        render.renderPopularAthletes(athletes);
    });

    const [athletes, events_, tags] = await Promise.all([
        api.fetchPopularAthletes(),
        api.fetchUpcomingEvents(),
        api.fetchTrendingTags(),
    ]);

    render.renderPopularAthletes(athletes);
    render.renderEventsExplore(events_);
    render.renderTrendingTags(tags);
}

async function initTrainingPage() {
    events.attachTrainingTabEvents(async (tabId) => {
        const trainings = await api.fetchTrainings(tabId);
        render.renderTrainings(trainings);
    });

    const initialTab = qs('.training-tabs .tab-btn.active')?.dataset.tab ?? 'saved';
    const trainings = await api.fetchTrainings(initialTab);
    render.renderTrainings(trainings);
}
