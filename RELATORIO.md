# Relatório da Refatoração — TheLocker

## 1. O que foi feito, em resumo

O projeto (antes: `index.html`, `profile.html`, `explore.html`, `training.html`,
`script.js`, `style.css`, `mockData.ts`, `types.ts`) foi reorganizado para:

- Não ter **nenhum dado fixo** no HTML ou no JS — tudo vem de funções prontas
  para consumir uma API REST (hoje simuladas com dados de exemplo).
- Não ter **nenhum `style=""`** nem **`onclick=""`** no HTML.
- Ter o JavaScript dividido em módulos com responsabilidade única.
- Ter o CSS organizado por seções comentadas, num único arquivo (`style.css`).
- Ter os SVGs preservados exatamente como estavam.

---

## 2. Estrutura final dos arquivos

```
thelocker/
├── index.html          → Feed
├── profile.html         → Perfil do atleta
├── explore.html          → Explorar
├── training.html          → Treinos
├── style.css              → Todo o CSS do projeto, em seções comentadas
├── js/
│   ├── config.js         → URL base da API e lista de endpoints
│   ├── dom-utils.js       → Funções pequenas reaproveitadas (qs, qsa, formatNumber, setColorVar)
│   ├── api.js             → ÚNICO lugar que "busca dados" (hoje: mock; amanhã: fetch)
│   ├── mock-data.js       → Dados de exemplo, só usados enquanto não há backend
│   ├── render.js          → Funções que recebem dados prontos e desenham na tela
│   ├── events.js          → Cliques e outras interações (delegação de eventos)
│   └── main.js             → Ponto de entrada: decide o que carregar em cada página
└── docs/
    └── api-schema.md      → Formato JSON esperado de cada endpoint da API
```

Por que separar assim? Cada arquivo responde a uma pergunta diferente:
- **api.js** → "de onde vêm os dados?"
- **render.js** → "como isso aparece na tela?"
- **events.js** → "o que acontece quando o usuário clica?"
- **main.js** → "o que fazer, em que ordem, em cada página?"

Isso significa que, quando o backend existir, **só o `api.js` muda**
(trocando o mock por `fetch()` de verdade) — `render.js`, `events.js` e o
HTML não precisam de nenhuma alteração.

---

## 3. Como funciona a preparação para a API (sem backend ainda)

Cada função de `api.js` (ex: `fetchFeedPosts()`) hoje devolve um dado de
`mock-data.js`, mas já está escrita do jeito que vai continuar quando o
backend existir — só falta trocar o `if (CONFIG.USE_MOCK_DATA)` por uma
chamada `fetch()` de verdade (que já está comentada, pronta, logo abaixo).
Exemplo real do arquivo:

```js
export async function fetchFeedPosts() {
    if (CONFIG.USE_MOCK_DATA) {
        return simulateNetworkDelay(mock.mockFeedPosts);
    }
    // TODO: quando a API estiver pronta, remover o bloco acima e usar:
    // return apiFetch(CONFIG.ENDPOINTS.FEED_POSTS);
}
```

Quando o backend estiver pronto, o processo é:
1. Trocar `CONFIG.USE_MOCK_DATA` para `false` em `config.js`.
2. Ajustar `CONFIG.BASE_URL` para o endereço real da API.
3. Pronto — nenhuma outra parte do projeto precisa mudar.

O formato exato de cada resposta esperada está documentado em
`docs/api-schema.md`, com um exemplo de JSON para cada endpoint.

---

## 4. Bugs encontrados e corrigidos

Além dos pontos que vocês já tinham identificado (imports faltando, CSS do
botão seguir, `.event-dot` sem regra), a refatoração revelou mais alguns:

| # | Problema | Onde estava | Correção |
|---|---|---|---|
| 1 | `script.js` usava `mockPopularAthletes` e `mockTrainings` sem importar — quebrava as páginas Explorar e Treinos | `script.js` | Resolvido pela própria separação em módulos (`api.js` importa tudo de `mock-data.js` corretamente) |
| 2 | `renderTeams()` recebia dados de **atletas**, não de **times** — os campos não batiam (`team.color` não existia) | `script.js` | `fetchMyTeams()` agora devolve dados de time de verdade (`mock.mockMyTeams`) |
| 3 | CSS tinha a classe `.profile-follow-btn`, mas o HTML usava `.follow-btn` — o botão "Seguir" do perfil nunca ficava do tamanho certo | `style.css` + `profile.html` | Unificado: `.follow-btn-lg` é aplicada junto com `.follow-btn` no botão do perfil |
| 4 | `.event-dot` (bolinha do evento na home) nunca teve `width`/`height`/`border-radius`/`background` definidos no CSS — ficava invisível | `style.css` | Regra `.event-dot` adicionada |
| 5 | `mockData.ts` e `types.ts` eram importados por um `<script type="module">` — isso não roda no navegador sem um bundler/compilador, e o projeto não usa nenhum | `script.js` | Convertido para `js/mock-data.js` (JavaScript puro, com comentários `@typedef` no lugar dos tipos, para o editor ainda sugerir os campos) |
| 6 | O botão de perfil no canto superior direito (avatar) não tinha link nenhum — clicar nele não fazia nada | Todas as páginas | Virou um `<a href="profile.html">` |
| 7 | O menu lateral de `index.html` usava uma estrutura (`<ul><li><a onclick="setActive(this)">`) completamente diferente da usada nas outras 3 páginas (`<button onclick="setActive(this)">`), e nenhuma delas de fato navegava entre as páginas | Todas as páginas | Padronizado: os 4 arquivos usam o mesmo menu, com `<a href="...">` reais para Feed/Explorar/Treinos, e a página atual é destacada automaticamente pelo JS (sem precisar de clique) |

---

## 5. Decisões de simplificação (o "porquê" de cada uma)

**Remoção de `onclick=""` → delegação de eventos em `events.js`**
Em vez de escrever `onclick="toggleLike(this)"` em cada botão do HTML (e
repetir isso em toda postagem nova criada pelo JS), o projeto escuta cliques
uma única vez, no `document.body`, e verifica o atributo `data-action` do
elemento clicado. Assim, um botão "Curtir" criado depois pelo `render.js`
(dentro de um post que veio da API) já funciona automaticamente, sem precisar
adicionar um novo `addEventListener` para ele.

**Remoção de `style=""` → variáveis CSS aplicadas via `dom-utils.setColorVar()`**
Cores que vêm dos dados (cor do esporte, cor do time) agora são passadas como
uma variável CSS (`--dot-color`) no próprio elemento, e é o `style.css` que
decide o que fazer com essa variável (virar fundo, borda, texto, gradiente).
O HTML/JS nunca escreve uma regra de estilo diretamente.

> Única exceção mantida: a altura das barras do gráfico de atividade
> (`style="height: X%"` dentro de `render.js`). Isso não é decoração, é o
> próprio valor sendo desenhado (como uma barra de progresso) — criar uma
> classe CSS para cada porcentagem possível não traria nenhum benefício real.

**`data-page` no `<body>` em vez de 4 blocos de `if (document.body.classList...)`**
Cada página agora tem um único atributo (`data-page="feed"`,
`data-page="profile"` etc.) e o `main.js` usa isso para decidir o que
carregar. É a mesma ideia de antes, só que com uma única fonte de verdade em
vez de checar várias classes CSS.

**Times/Estatísticas/Eventos continuam como botões desativados**
Essas 3 opções do menu lateral não têm página própria ainda (não existiam no
projeto original). Deixei os botões visíveis, mas desabilitados
(`disabled`, com um `title="Em breve"`), em vez de link quebrado ou clique
sem efeito.

---

## 6. O que **não** foi alterado sem necessidade

- Todos os SVGs foram mantidos exatamente como estavam (mesmo `path`,
  mesmos atributos), só reorganizados dentro da nova estrutura de menu.
- O layout, as cores, tipografia e responsividade originais foram
  preservados — o CSS só ganhou comentários de seção, variáveis para
  substituir os `style=""`, e a correção dos dois bugs (`.event-dot` e
  `.profile-follow-btn`).
- Nenhuma biblioteca ou dependência nova foi adicionada — o projeto continua
  100% HTML/CSS/JavaScript puro, sem bundler.

---

## 7. Próximos passos sugeridos (não implementados agora)

- Ligar os botões "Publicar" (nova postagem) e "Carregar mais" a chamadas
  reais da API, quando o backend existir.
- Trocar o `alert`/efeito local de curtir, seguir e salvar por uma chamada
  real (os `// TODO` já indicam exatamente onde, em `events.js`).
- Quando a página de perfil de outros atletas existir de verdade, usar o
  parâmetro `?id=` que o `main.js` já lê da URL (hoje sempre cai no atleta
  de exemplo).
