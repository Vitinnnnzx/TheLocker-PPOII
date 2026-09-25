/* ================================================================
   KINETIC-GRID.JS — Claudio
   ------------------------------------------------------------------
   Arquivo 100% NOVO, JS puro (sem bibliotecas). Faz duas coisas:

   1) Monta as linhas de palavras dentro de #kineticGridInner,
      distribuindo profundidade (tamanho/opacidade/blur/velocidade)
      entre as linhas — as do meio ficam mais nítidas ("frente"),
      as das bordas mais apagadas e desfocadas ("fundo").

   2) Aplica um tilt 3D (rotateX/rotateY) em #kineticGrid que segue
      o mouse dentro de .auth-visual, com suavização (lerp) via
      requestAnimationFrame — por isso o movimento fica "muito
      suave" mesmo se o mouse se mover rápido.

   Só roda na página que tiver o elemento #kineticGrid no HTML
   (hoje: criar-time.html) — em qualquer outra página este arquivo
   simplesmente não faz nada.
   ================================================================ */
(function kineticGridInit() {
  const container = document.getElementById("kineticGrid");
  const inner = document.getElementById("kineticGridInner");
  if (!container || !inner) return;

  const PALAVRAS = [
    "TEAM",
    "SCOUT",
    "CONNECT",
    "PERFORMANCE",
    "NETWORK",
    "AGENT",
    "ATLETA",
    "RECRUTADOR",
    "TALENTO",
    "ELENCO",
  ];

  const NUM_LINHAS = 7;
  const REDUZIR_MOVIMENTO = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const PONTEIRO_FINO = window.matchMedia("(pointer: fine)").matches;

  /* ---------- 1) Construção das linhas de palavras ---------- */

  function embaralhar(lista) {
    const copia = lista.slice();
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
  }

  function construirLinhas() {
    const frag = document.createDocumentFragment();

    for (let i = 0; i < NUM_LINHAS; i++) {
      const linha = document.createElement("div");
      const direcao = i % 2 === 0 ? "dir-left" : "dir-right";
      linha.className = "kinetic-row " + direcao + (i % 3 === 0 ? " float" : "");

      // profundidade: 0 = linha central (frente/nítida), 1 = linha
      // nas bordas (fundo/apagada e borrada)
      const centro = (NUM_LINHAS - 1) / 2;
      const profundidade = Math.abs(i - centro) / centro;

      const tamanho = 42 - profundidade * 16; // 42px no centro -> 26px nas bordas
      const opacidade = 0.11 - profundidade * 0.06; // 0.11 -> 0.05
      const desfoque = profundidade * 2.4; // 0px -> ~2.4px
      const duracao = 36 + i * 5 + Math.random() * 8; // velocidades variadas por linha

      linha.style.setProperty("--kw-size", tamanho.toFixed(0) + "px");
      linha.style.setProperty("--kw-op", opacidade.toFixed(3));
      linha.style.setProperty("--kw-blur", desfoque.toFixed(2) + "px");
      linha.style.setProperty("--kw-dur", duracao.toFixed(1) + "s");

      // cada linha recebe as palavras em ordem embaralhada, e a
      // sequência é duplicada (2x) para o loop de animação fechar
      // perfeitamente sem "pulo" visível.
      const sequencia = embaralhar(PALAVRAS);
      const conteudo = sequencia.concat(sequencia);

      conteudo.forEach((palavra) => {
        const span = document.createElement("span");
        span.textContent = palavra;
        linha.appendChild(span);
      });

      frag.appendChild(linha);
    }

    inner.appendChild(frag);
  }

  construirLinhas();

  /* ---------- 2) Tilt 3D suave, controlado pelo mouse ---------- */

  // Sem tilt em quem pediu menos movimento, e sem tilt em telas
  // touch (onde não existe "hover" de mouse fazendo sentido nenhum).
  if (REDUZIR_MOVIMENTO || !PONTEIRO_FINO) return;

  const painel = document.querySelector(".auth-visual");
  if (!painel) return;

  const ANGULO_MAX = 9; // graus — sutil, corporativo, nada de exagero
  const SUAVIZACAO = 0.055; // quanto menor, mais suave/lento o "follow" do mouse

  let alvoX = 0,
    alvoY = 0,
    atualX = 0,
    atualY = 0;

  painel.addEventListener("mousemove", (evento) => {
    const rect = painel.getBoundingClientRect();
    const px = (evento.clientX - rect.left) / rect.width; // 0 a 1
    const py = (evento.clientY - rect.top) / rect.height; // 0 a 1

    alvoY = (px - 0.5) * ANGULO_MAX * 2; // eixo Y = movimento horizontal do mouse
    alvoX = (0.5 - py) * ANGULO_MAX * 2; // eixo X = movimento vertical do mouse
  });

  painel.addEventListener("mouseleave", () => {
    // volta suavemente ao centro quando o mouse sai do painel
    alvoX = 0;
    alvoY = 0;
  });

  function animar() {
    // interpolação linear (lerp): a cada frame o valor "atual" anda
    // uma fração do caminho até o "alvo" — isso é o que dá a sensação
    // de resposta suave/fluida em vez de um tilt "travado" no mouse.
    atualX += (alvoX - atualX) * SUAVIZACAO;
    atualY += (alvoY - atualY) * SUAVIZACAO;

    container.style.transform =
      "rotateX(" + atualX.toFixed(3) + "deg) rotateY(" + atualY.toFixed(3) + "deg)";

    requestAnimationFrame(animar);
  }

  requestAnimationFrame(animar);
})();
