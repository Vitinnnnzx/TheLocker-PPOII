// mock-data.js
//
// Dados de exemplo usados apenas ENQUANTO a API real não existe.
// Este arquivo é a única fonte de dados "falsos" do projeto — quando o
// backend estiver pronto, o js/api.js deixa de importar daqui e passa a
// usar fetch() de verdade. Nenhum outro arquivo deveria importar deste módulo.
//
// Os comentários JSDoc abaixo documentam o "formato" de cada objeto
// (antes descrito em types.ts). Isso ajuda o editor a dar sugestões
// mesmo sem estarmos usando TypeScript de fato no navegador.

/**
 * @typedef {Object} AthleteProfile
 * @property {string} id
 * @property {string} name
 * @property {string} handle
 * @property {string} avatar
 * @property {string} sport
 * @property {string} sportColor
 * @property {string} [bio]
 * @property {string} followers
 * @property {string} following
 * @property {boolean} verified
 */

/**
 * @typedef {Object} AthleteStats
 * @property {number} trainings
 * @property {number} km
 * @property {string} activeTime
 * @property {number} kcal
 * @property {number[]} dailyActivity Porcentagens (0-100) para o gráfico da semana
 */

/**
 * @typedef {Object} Post
 * @property {string} id
 * @property {string} author
 * @property {string} handle
 * @property {string} avatar
 * @property {string} sport
 * @property {string} sportColor
 * @property {string} time
 * @property {string} content
 * @property {string} [image]
 * @property {{distance?: string, pace?: string, duration?: string, calories?: string}} [stats]
 * @property {number} likes
 * @property {number} comments
 * @property {number} shares
 * @property {boolean} liked
 */

/**
 * @typedef {Object} Team
 * @property {string} id
 * @property {string} name
 * @property {string} sport
 * @property {string} color
 */

/**
 * @typedef {Object} Event
 * @property {string} id
 * @property {string} name
 * @property {string} date
 * @property {string} sport
 * @property {number} participants
 * @property {string} color
 */

/**
 * @typedef {Object} Training
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} sport
 * @property {string} sportColor
 * @property {'Iniciante'|'Intermediário'|'Avançado'} difficulty
 * @property {string} duration
 * @property {number} exercises
 * @property {string} author
 * @property {string} authorHandle
 * @property {string} authorAvatar
 * @property {string} [image]
 * @property {boolean} saved
 */

export const mockCurrentUser = {
    id: 'me',
    name: 'Você',
    avatar: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=64&h=64&fit=crop&auto=format',
};

export const mockStories = [
    { id: 's1', name: 'Lucas R.', avatar: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=80&h=80&fit=crop&auto=format', seen: false },
    { id: 's2', name: 'Ana Silva', avatar: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=80&h=80&fit=crop&auto=format', seen: false },
    { id: 's3', name: 'Pedro M.', avatar: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=80&h=80&fit=crop&auto=format', seen: true },
];

export const mockWeekStats = {
    trainings: 6,
    km: 47.3,
    activeTime: '8:42',
    kcal: 4280,
    dailyActivity: [35, 60, 80, 45, 90, 70, 55],
};

export const mockMyTeams = [
    { id: 't1', name: 'Flamengo FC', sport: 'Futebol', color: '#FF4D4D' },
    { id: 't2', name: 'Team Alpha', sport: 'CrossFit', color: '#C8FF00' },
    { id: 't3', name: 'Run Crew SP', sport: 'Corrida', color: '#3B82F6' },
];

export const mockFeedPosts = [
    {
        id: '1',
        author: 'Lucas Rodrigues',
        handle: 'lucasrod',
        avatar: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=80&h=80&fit=crop&auto=format',
        sport: 'Natação',
        sportColor: '#3B82F6',
        time: '2h atrás',
        content: 'Sessão matinal concluída! 4km no pool olímpico, foco em técnica de virada. Sentindo evolução clara no crawl depois das ajustes do treinador. Domingo tem competição estadual — preparado! 💪',
        stats: { distance: '4.0', pace: '1:45', duration: '1:10:00', calories: '620' },
        likes: 284,
        comments: 31,
        shares: 12,
        liked: false,
    },
];

export const mockAthleteProfile = {
    id: '1',
    name: 'Fernanda Costa',
    handle: 'fecosta',
    avatar: 'https://images.unsplash.com/photo-1526676317768-d9b14f15615a?w=64&h=64&fit=crop&auto=format',
    sport: 'Triathlon',
    sportColor: '#3B82F6',
    bio: 'Atleta profissional de Triathlon, buscando sempre superar limites. Apaixonada por natação, ciclismo e corrida. Compartilhando minha jornada e inspirando outros a se movimentarem!',
    followers: '12.4k',
    following: '350',
    verified: true,
};

export const mockAthleteStats = {
    trainings: 24,
    km: 180.5,
    activeTime: '32:15',
    kcal: 15800,
    dailyActivity: [40, 70, 90, 50, 100, 80, 60],
};

export const mockAthletePosts = [
    {
        id: '1',
        author: 'Fernanda Costa',
        handle: 'fecosta',
        avatar: 'https://images.unsplash.com/photo-1526676317768-d9b14f15615a?w=64&h=64&fit=crop&auto=format',
        sport: 'Triathlon',
        sportColor: '#3B82F6',
        time: '3h atrás',
        content: 'Treino de ciclismo concluído! 80km com altimetria desafiadora. As pernas estão queimando, mas a vista compensou! #ciclismo #triathlon #treino',
        image: 'https://images.unsplash.com/photo-1574680096145-d05b4747414c?w=600&h=340&fit=crop&auto=format',
        stats: { distance: '80.0', duration: '2:45:00', calories: '1200' },
        likes: 450,
        comments: 55,
        shares: 20,
        liked: false,
    },
    {
        id: '2',
        author: 'Fernanda Costa',
        handle: 'fecosta',
        avatar: 'https://images.unsplash.com/photo-1526676317768-d9b14f15615a?w=64&h=64&fit=crop&auto=format',
        sport: 'Natação',
        sportColor: '#3B82F6',
        time: '1 dia atrás',
        content: 'Sessão de natação matinal. 3km na piscina, focando na técnica de braçada. Cada braçada conta! #natação #triathlon #foco',
        stats: { distance: '3.0', pace: '1:30', duration: '1:00:00', calories: '500' },
        likes: 320,
        comments: 30,
        shares: 10,
        liked: true,
    },
];

export const mockSuggestedAthletes = [
    { id: '1', name: 'Fernanda Costa', handle: 'fecosta', sport: 'Triathlon', avatar: 'https://images.unsplash.com/photo-1526676317768-d9b14f15615a?w=64&h=64&fit=crop&auto=format', followers: '12.4k', following: '350', verified: true },
    { id: '2', name: 'Rafael Souza', handle: 'rafasouza', sport: 'Ciclismo', avatar: 'https://images.unsplash.com/photo-1461897104016-0b3b00cc81ee?w=64&h=64&fit=crop&auto=format', followers: '8.1k', following: '200', verified: false },
];

export const mockUpcomingEvents = [
    { id: '1', name: 'Maratona de São Paulo', date: '12 Out', sport: 'Corrida', participants: 34200, color: '#FF4D4D' },
    { id: '2', name: 'Campeonato CrossFit SP', date: '19 Out', sport: 'CrossFit', participants: 480, color: '#C8FF00' },
];

export const mockTrendingTags = [
    { tag: '#MaratonaSP', posts: '4.2k' },
    { tag: '#CrossFitBrasil', posts: '2.8k' },
    { tag: '#TreinoDeForca', posts: '1.9k' },
];

export const mockPopularAthletes = [
    { id: '1', name: 'Fernanda Costa', handle: 'fecosta', sport: 'Triathlon', avatar: 'https://images.unsplash.com/photo-1526676317768-d9b14f15615a?w=64&h=64&fit=crop&auto=format', followers: '12.4k', following: '350', verified: true },
    { id: '2', name: 'Rafael Souza', handle: 'rafasouza', sport: 'Ciclismo', avatar: 'https://images.unsplash.com/photo-1461897104016-0b3b00cc81ee?w=64&h=64&fit=crop&auto=format', followers: '8.1k', following: '200', verified: false },
    { id: '3', name: 'Bianca Lopes', handle: 'biancafit', sport: 'Ginástica', avatar: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=64&h=64&fit=crop&auto=format', followers: '21.7k', following: '400', verified: true },
    { id: '4', name: 'Lucas Rodrigues', handle: 'lucasrod', sport: 'Natação', avatar: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=80&h=80&fit=crop&auto=format', followers: '5.2k', following: '150', verified: false },
    { id: '5', name: 'Marcos Teixeira', handle: 'marcospwr', sport: 'Musculação', avatar: 'https://images.unsplash.com/photo-1556817411-31ae72fa3ea0?w=80&h=80&fit=crop&auto=format', followers: '15.8k', following: '320', verified: true },
    { id: '6', name: 'Carol Barbosa', handle: 'carolfit', sport: 'Futebol', avatar: 'https://images.unsplash.com/photo-1461897104016-0b3b00cc81ee?w=64&h=64&fit=crop&auto=format', followers: '9.3k', following: '280', verified: false },
];

export const mockTrainings = [
    {
        id: '1',
        title: 'Treino de Força - Peito e Costas',
        description: 'Treino completo focado em força e hipertrofia para peito e costas. 5 exercícios, 4 séries cada.',
        sport: 'Musculação',
        sportColor: '#F97316',
        difficulty: 'Intermediário',
        duration: '1h 15min',
        exercises: 5,
        author: 'Marcos Teixeira',
        authorHandle: 'marcospwr',
        authorAvatar: 'https://images.unsplash.com/photo-1556817411-31ae72fa3ea0?w=80&h=80&fit=crop&auto=format',
        image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=300&h=200&fit=crop&auto=format',
        saved: true,
    },
    {
        id: '2',
        title: 'Corrida Intervalada - 5km',
        description: 'Treino de corrida com intervalos para melhorar velocidade e resistência. Ideal para iniciantes.',
        sport: 'Corrida',
        sportColor: '#FF4D4D',
        difficulty: 'Iniciante',
        duration: '45min',
        exercises: 1,
        author: 'Pedro Mendes',
        authorHandle: 'pedrorun',
        authorAvatar: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=80&h=80&fit=crop&auto=format',
        image: 'https://images.unsplash.com/photo-1461897104016-0b3b00cc81ee?w=300&h=200&fit=crop&auto=format',
        saved: false,
    },
    {
        id: '3',
        title: 'Natação Técnica - Crawl',
        description: 'Sessão focada em técnica de nado crawl. Exercícios de braçada, respiração e coordenação.',
        sport: 'Natação',
        sportColor: '#3B82F6',
        difficulty: 'Intermediário',
        duration: '1h',
        exercises: 6,
        author: 'Lucas Rodrigues',
        authorHandle: 'lucasrod',
        authorAvatar: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=80&h=80&fit=crop&auto=format',
        image: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=300&h=200&fit=crop&auto=format',
        saved: true,
    },
    {
        id: '4',
        title: 'Ciclismo - Subida de Montanha',
        description: 'Treino desafiador de ciclismo em terreno montanhoso. Melhora resistência e força nas pernas.',
        sport: 'Ciclismo',
        sportColor: '#10B981',
        difficulty: 'Avançado',
        duration: '2h 30min',
        exercises: 1,
        author: 'Rafael Souza',
        authorHandle: 'rafasouza',
        authorAvatar: 'https://images.unsplash.com/photo-1461897104016-0b3b00cc81ee?w=64&h=64&fit=crop&auto=format',
        image: 'https://images.unsplash.com/photo-1574680096145-d05b4747414c?w=300&h=200&fit=crop&auto=format',
        saved: false,
    },
    {
        id: '5',
        title: 'CrossFit WOD - Cardio',
        description: 'Workout of the Day focado em resistência cardiovascular. Alta intensidade, baixa duração.',
        sport: 'CrossFit',
        sportColor: '#C8FF00',
        difficulty: 'Avançado',
        duration: '30min',
        exercises: 3,
        author: 'Ana Silva',
        authorHandle: 'anafit',
        authorAvatar: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=64&h=64&fit=crop&auto=format',
        image: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=300&h=200&fit=crop&auto=format',
        saved: true,
    },
];
