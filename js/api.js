// api.js
//
// Esta é a ÚNICA camada do projeto que "busca dados".
// Nenhuma função de renderização (render.js) ou de eventos (events.js)
// deve conhecer de onde os dados vêm — elas só recebem o resultado
// destas funções.
//
// Hoje (sem backend pronto) cada função devolve dados de exemplo
// (mock-data.js) simulando uma pequena espera de rede, para o app já
// funcionar como se estivesse "online".
//
// Quando a API REST existir, é só trocar o corpo de cada função pelo
// fetch() comentado logo abaixo dela — o "formato" (JSON) que a API deve
// devolver está descrito no comentário de cada função.

import { CONFIG } from './config.js';
import * as mock from './mock-data.js';

// Pequeno atraso artificial só para simular uma requisição de rede real.
function simulateNetworkDelay(data, ms = 250) {
    return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

// Função central de requisição HTTP, pronta para quando a API existir.
async function apiFetch(path) {
    const response = await fetch(`${CONFIG.BASE_URL}${path}`);
    if (!response.ok) {
        throw new Error(`Erro ao buscar ${path}: ${response.status}`);
    }
    return response.json();
}

/**
 * Busca os dados do usuário logado (avatar/nome usados na navbar e na caixa de postagem).
 * Formato esperado: { id, name, avatar }
 */
export async function fetchCurrentUser() {
    if (CONFIG.USE_MOCK_DATA) {
        return simulateNetworkDelay(mock.mockCurrentUser);
    }
    // TODO: return apiFetch(CONFIG.ENDPOINTS.CURRENT_USER);
}

/**
 * Busca os stories exibidos no topo do feed.
 * Formato esperado: { id, name, avatar, seen }[]
 */
export async function fetchStories() {
    if (CONFIG.USE_MOCK_DATA) {
        return simulateNetworkDelay(mock.mockStories);
    }
    // TODO: return apiFetch(CONFIG.ENDPOINTS.STORIES);
}

/**
 * Busca os posts do feed principal.
 * Formato esperado da API: Post[] (ver mock-data.js -> @typedef Post)
 */
export async function fetchFeedPosts() {
    if (CONFIG.USE_MOCK_DATA) {
        return simulateNetworkDelay(mock.mockFeedPosts);
    }
    // TODO: quando a API estiver pronta, remover o bloco acima e usar:
    // return apiFetch(CONFIG.ENDPOINTS.FEED_POSTS);
}

/**
 * Busca as estatísticas da semana do usuário logado.
 * Formato esperado: AthleteStats (sem o campo "trainings" duplicado)
 */
export async function fetchWeekStats() {
    if (CONFIG.USE_MOCK_DATA) {
        return simulateNetworkDelay(mock.mockWeekStats);
    }
    // TODO: return apiFetch(CONFIG.ENDPOINTS.WEEK_STATS);
}

/**
 * Busca os times que o usuário logado participa.
 * Formato esperado: Team[]
 */
export async function fetchMyTeams() {
    if (CONFIG.USE_MOCK_DATA) {
        return simulateNetworkDelay(mock.mockMyTeams);
    }
    // TODO: return apiFetch(CONFIG.ENDPOINTS.TEAMS);
}

/**
 * Busca atletas sugeridos para seguir.
 * Formato esperado: AthleteProfile[]
 */
export async function fetchSuggestedAthletes() {
    if (CONFIG.USE_MOCK_DATA) {
        return simulateNetworkDelay(mock.mockSuggestedAthletes);
    }
    // TODO: return apiFetch(CONFIG.ENDPOINTS.SUGGESTED_ATHLETES);
}

/**
 * Busca os próximos eventos esportivos.
 * Formato esperado: Event[]
 */
export async function fetchUpcomingEvents() {
    if (CONFIG.USE_MOCK_DATA) {
        return simulateNetworkDelay(mock.mockUpcomingEvents);
    }
    // TODO: return apiFetch(CONFIG.ENDPOINTS.UPCOMING_EVENTS);
}

/**
 * Busca as tags em alta.
 * Formato esperado: { tag: string, posts: string }[]
 */
export async function fetchTrendingTags() {
    if (CONFIG.USE_MOCK_DATA) {
        return simulateNetworkDelay(mock.mockTrendingTags);
    }
    // TODO: return apiFetch(CONFIG.ENDPOINTS.TRENDING_TAGS);
}

/**
 * Busca atletas populares para a página Explorar.
 * Aceita filtros opcionais (esporte, nível, localização).
 * Formato esperado: AthleteProfile[]
 */
export async function fetchPopularAthletes(filters = {}) {
    if (CONFIG.USE_MOCK_DATA) {
        return simulateNetworkDelay(mock.mockPopularAthletes);
    }
    // TODO: montar query string com os filtros e usar:
    // const params = new URLSearchParams(filters).toString();
    // return apiFetch(`${CONFIG.ENDPOINTS.POPULAR_ATHLETES}?${params}`);
}

/**
 * Busca o perfil completo de um atleta.
 * Formato esperado: AthleteProfile
 */
export async function fetchAthleteProfile(athleteId) {
    if (CONFIG.USE_MOCK_DATA) {
        return simulateNetworkDelay(mock.mockAthleteProfile);
    }
    // TODO: return apiFetch(CONFIG.ENDPOINTS.ATHLETE_PROFILE(athleteId));
}

/**
 * Busca as estatísticas de um atleta.
 * Formato esperado: AthleteStats
 */
export async function fetchAthleteStats(athleteId) {
    if (CONFIG.USE_MOCK_DATA) {
        return simulateNetworkDelay(mock.mockAthleteStats);
    }
    // TODO: return apiFetch(CONFIG.ENDPOINTS.ATHLETE_STATS(athleteId));
}

/**
 * Busca os posts publicados por um atleta.
 * Formato esperado: Post[]
 */
export async function fetchAthletePosts(athleteId) {
    if (CONFIG.USE_MOCK_DATA) {
        return simulateNetworkDelay(mock.mockAthletePosts);
    }
    // TODO: return apiFetch(CONFIG.ENDPOINTS.ATHLETE_POSTS(athleteId));
}

/**
 * Busca os treinos (salvos, criados ou completados).
 * Formato esperado: Training[]
 */
export async function fetchTrainings(tab = 'saved') {
    if (CONFIG.USE_MOCK_DATA) {
        return simulateNetworkDelay(mock.mockTrainings);
    }
    // TODO: return apiFetch(`${CONFIG.ENDPOINTS.TRAININGS}?tab=${tab}`);
}
