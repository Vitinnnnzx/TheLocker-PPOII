// config.js
// Configurações globais da aplicação.
// Quando o backend estiver pronto, basta ajustar a BASE_URL abaixo.

export const CONFIG = {
    // TODO: trocar pela URL real da API quando o backend estiver no ar
    BASE_URL: 'https://api.thelocker.com.br',

    ENDPOINTS: {
        FEED_POSTS: '/posts/feed',
        WEEK_STATS: '/users/me/week-stats',
        TEAMS: '/users/me/teams',
        SUGGESTED_ATHLETES: '/athletes/suggested',
        UPCOMING_EVENTS: '/events/upcoming',
        TRENDING_TAGS: '/tags/trending',
        POPULAR_ATHLETES: '/athletes/popular',
        ATHLETE_PROFILE: (id) => `/athletes/${id}`,
        ATHLETE_STATS: (id) => `/athletes/${id}/stats`,
        ATHLETE_POSTS: (id) => `/athletes/${id}/posts`,
        TRAININGS: '/trainings',
        CURRENT_USER: '/users/me',
        STORIES: '/stories',
    },

    // Enquanto não existe backend, usamos dados de exemplo (mock).
    // Ver js/mock-data.js e js/api.js para entender o funcionamento.
    USE_MOCK_DATA: true,
};
