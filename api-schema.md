# TheLocker — Formato dos dados da API (JSON)

Este documento mostra o que cada função de `js/api.js` espera **receber de volta**
quando o backend real existir. Hoje (sem backend) essas mesmas formas de dado
são simuladas em `js/mock-data.js`.

> Convenção adotada: o banco de dados (ver `Banco_de_Dados_TheLocker.docx`) usa
> nomes de campo em português/snake_case (`id_usuario`, `nome_completo`...).
> A API, por sua vez, devolve os dados já traduzidos para o formato que o
> front-end usa (camelCase, em inglês) — isso é normal e é papel do backend
> fazer essa tradução, para o front-end não depender da estrutura interna do banco.

---

## GET /users/me
Usado por `fetchCurrentUser()`. Preenche o avatar da navbar e da caixa de postagem.

```json
{
  "id": "u1",
  "name": "Fernanda Costa",
  "avatar": "https://.../avatar.jpg"
}
```

---

## GET /stories
Usado por `fetchStories()`.

```json
[
  { "id": "s1", "name": "Lucas R.", "avatar": "https://.../lucas.jpg", "seen": false },
  { "id": "s2", "name": "Ana Silva", "avatar": "https://.../ana.jpg", "seen": true }
]
```

---

## GET /posts/feed
Usado por `fetchFeedPosts()`. O mesmo formato de "Post" é usado no perfil do atleta
(`GET /athletes/:id/posts`).

```json
[
  {
    "id": "p1",
    "author": "Lucas Rodrigues",
    "handle": "lucasrod",
    "avatar": "https://.../lucas.jpg",
    "sport": "Natação",
    "sportColor": "#3B82F6",
    "time": "2h atrás",
    "content": "Sessão matinal concluída! 4km no pool olímpico...",
    "image": null,
    "stats": {
      "distance": "4.0",
      "pace": "1:45",
      "duration": "1:10:00",
      "calories": "620"
    },
    "likes": 284,
    "comments": 31,
    "shares": 12,
    "liked": false
  }
]
```

Campo `stats` é opcional e cada uma de suas chaves também é opcional
(um post de musculação, por exemplo, pode não ter `pace`).

---

## GET /users/me/week-stats
Usado por `fetchWeekStats()`. Mesmo formato de `GET /athletes/:id/stats`
(estatísticas do perfil do atleta).

```json
{
  "trainings": 6,
  "km": 47.3,
  "activeTime": "8:42",
  "kcal": 4280,
  "dailyActivity": [35, 60, 80, 45, 90, 70, 55]
}
```

`dailyActivity` são 7 porcentagens (0 a 100), uma por dia da semana, usadas no
gráfico de barras.

---

## GET /users/me/teams
Usado por `fetchMyTeams()` (sidebar "Meus Times" em todas as páginas).

```json
[
  { "id": "t1", "name": "Flamengo FC", "sport": "Futebol", "color": "#FF4D4D" },
  { "id": "t2", "name": "Team Alpha", "sport": "CrossFit", "color": "#C8FF00" }
]
```

---

## GET /athletes/suggested
Usado por `fetchSuggestedAthletes()` (painel "Atletas em Destaque" do feed).
Mesmo formato de `GET /athletes/popular` (página Explorar) e
`GET /athletes/:id` (perfil completo, que soma o campo `bio`).

```json
{
  "id": "1",
  "name": "Fernanda Costa",
  "handle": "fecosta",
  "avatar": "https://.../fernanda.jpg",
  "sport": "Triathlon",
  "sportColor": "#3B82F6",
  "bio": "Atleta profissional de Triathlon, buscando sempre superar limites.",
  "followers": "12.4k",
  "following": "350",
  "verified": true
}
```

`bio` só é necessária no perfil completo (`GET /athletes/:id`); nas listas
resumidas (sugestões, populares) esse campo pode vir vazio ou ser omitido.

---

## GET /athletes/popular?sport=&level=&location=
Usado por `fetchPopularAthletes(filters)` na página Explorar.
Devolve uma lista no mesmo formato do bloco anterior (`AthleteProfile[]`).
Os filtros são enviados como query string, por exemplo:

```
GET /athletes/popular?sport=natacao&level=intermediario&location=São Paulo
```

---

## GET /events/upcoming
Usado por `fetchUpcomingEvents()` (feed e página Explorar).

```json
[
  {
    "id": "e1",
    "name": "Maratona de São Paulo",
    "date": "12 Out",
    "sport": "Corrida",
    "participants": 34200,
    "color": "#FF4D4D"
  }
]
```

---

## GET /tags/trending
Usado por `fetchTrendingTags()` (página Explorar).

```json
[
  { "tag": "#MaratonaSP", "posts": "4.2k" },
  { "tag": "#CrossFitBrasil", "posts": "2.8k" }
]
```

---

## GET /trainings?tab=saved|created|completed
Usado por `fetchTrainings(tab)` (página Treinos).

```json
[
  {
    "id": "tr1",
    "title": "Treino de Força - Peito e Costas",
    "description": "Treino completo focado em força e hipertrofia...",
    "sport": "Musculação",
    "difficulty": "Intermediário",
    "duration": "1h 15min",
    "exercises": 5,
    "author": "Marcos Teixeira",
    "authorHandle": "marcospwr",
    "authorAvatar": "https://.../marcos.jpg",
    "image": "https://.../treino-forca.jpg",
    "saved": true
  }
]
```

`difficulty` é sempre um destes três valores: `"Iniciante"`, `"Intermediário"` ou `"Avançado"`.

---

## Ações do usuário (curtir, seguir, salvar)

Essas ações já têm o botão e o efeito visual prontos no front-end
(`js/events.js`), mas ainda não enviam nada para o backend — cada uma tem um
comentário `// TODO` no lugar exato onde a chamada deve entrar. Endpoints sugeridos:

| Ação | Método | Endpoint |
|---|---|---|
| Curtir / descurtir post | `POST` / `DELETE` | `/posts/:id/like` |
| Salvar / remover post | `POST` / `DELETE` | `/posts/:id/save` |
| Seguir / deixar de seguir atleta | `POST` / `DELETE` | `/athletes/:id/follow` |
| Salvar / remover treino | `POST` / `DELETE` | `/trainings/:id/save` |

Nenhum desses precisa devolver um corpo grande — um `204 No Content` ou
`{ "ok": true }` já é suficiente, já que o front-end atualiza o botão
otimisticamente (na hora do clique, sem esperar resposta).

---

## Sobre as cores (`sportColor`, `color`, `--dot-color`)

No front-end, qualquer elemento que precise de uma cor vinda dos dados
(bolinha de time, indicador de esporte no post, tag de esporte, data do
evento, capa do treino sem imagem) recebe essa cor através de uma variável
CSS (`--dot-color` ou `--placeholder-color`), aplicada pelo JavaScript
(`dom-utils.js` → `setColorVar`) — **nunca** com `style=""` escrito à mão no HTML.
Quem decide a aparência final (o que a variável faz: virar `background`,
`color`, um gradiente etc.) é sempre o `style.css`.

Três formatos de resposta trazem uma cor:
- `Post` e `AthleteProfile` usam `sportColor` (cor do indicador/tag de esporte).
- `Training` também pode receber `sportColor`, usado como fundo quando o
  treino não tem imagem de capa.
- `Team` e `Event` usam `color` (cor da bolinha/data em destaque).

Isso deixa a cor como uma decisão de quem cadastra o dado (o backend/banco),
e não uma regra fixa no front-end — por exemplo, dois times de futebol podem
ter cores diferentes, já que a cor não depende só do `sport`.
