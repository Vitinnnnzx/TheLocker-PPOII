const ICONS = {
  feed: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/></svg>',
  perfil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.5"/><path d="M4.5 20c1.6-3.6 4.4-5.5 7.5-5.5s5.9 1.9 7.5 5.5"/></svg>',
  time: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4 6v5c0 4.6 3.2 8.2 8 10 4.8-1.8 8-5.4 8-10V6l-8-3Z"/></svg>',
  config: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.14.36.4.66.74.86.34.2.72.3 1.11.28H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.5s-7.5-4.6-9.8-9.1C.6 8.1 2 4.8 5.3 4.1c2-.4 3.9.5 5 2.1a5.6 5.6 0 0 1 5-2.1c3.3.7 4.7 4 3.1 7.3-2.3 4.5-9.8 9.1-9.8 9.1Z"/></svg>',
  heartFilled: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 20.5s-7.5-4.6-9.8-9.1C.6 8.1 2 4.8 5.3 4.1c2-.4 3.9.5 5 2.1a5.6 5.6 0 0 1 5-2.1c3.3.7 4.7 4 3.1 7.3-2.3 4.5-9.8 9.1-9.8 9.1Z"/></svg>',
  comment: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 1 1-3.4-6.6L21 4l-1 3.6A7.9 7.9 0 0 1 21 12Z"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  chevronDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
  logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>',
  pencil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>',
  arrowLeft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>',
  alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
};

/* ================================================================
   [ENHANCE.JS — Claudio] Efeito 3D "tilt + spotlight" nos cards
   ------------------------------------------------------------------
   Bloco 100% NOVO e ADITIVO, anexado no final do icons.js (o único
   script já carregado em TODAS as páginas do site) para não precisar
   adicionar nenhuma tag <script> nova em nenhum HTML.

   O que faz: quando o mouse passa sobre um post, um card de resultado
   de busca (.adv-card), um card de time (.team-card) ou um "pillar"
   da landing page, o card ganha uma leve inclinação 3D (rotateX/Y)
   que acompanha o cursor, mais um brilho discreto ("spotlight") na
   posição do mouse. O CSS que define a aparência desse efeito está
   em /static/css/enhancements.css (classe .tilt-3d).

   Cuidados tomados de propósito:
   - Só ativa em dispositivos com mouse de precisão (pointer: fine),
     nunca em touch — em celular o efeito simplesmente não existe.
   - Respeita "prefers-reduced-motion": se a pessoa pediu menos
     movimento no sistema, o efeito nem é inicializado.
   - Ângulo máximo de apenas 6°, para manter a seriedade do produto
     (nada de inclinação exagerada tipo "app de jogo").
   - Funciona também para cards que são inseridos dinamicamente
     depois (posts do feed, resultados de busca), via MutationObserver
     — nenhum HTML/JS existente precisou ser alterado para isso.
   ================================================================ */
(function tlockerEnhanceInit() {
  const PODE_ANIMAR =
    window.matchMedia("(pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!PODE_ANIMAR) return;

  const SELETOR_TILT = ".post, .adv-card, .team-card, .pillar";
  const ANGULO_MAX = 6; // graus — sutil, sem exagero "gamer"

  function aplicarTilt(el) {
    if (!el || el.dataset.tiltReady) return;
    el.dataset.tiltReady = "1";
    el.classList.add("tilt-3d");

    let raf = null;

    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width; // 0 a 1
      const py = (e.clientY - rect.top) / rect.height; // 0 a 1

      const rotY = (px - 0.5) * ANGULO_MAX * 2;
      const rotX = (0.5 - py) * ANGULO_MAX * 2;

      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.classList.add("tilt-active");
        el.style.setProperty("--tilt-x", rotX.toFixed(2) + "deg");
        el.style.setProperty("--tilt-y", rotY.toFixed(2) + "deg");
        el.style.setProperty("--spot-x", (px * 100).toFixed(1) + "%");
        el.style.setProperty("--spot-y", (py * 100).toFixed(1) + "%");
      });
    });

    el.addEventListener("mouseleave", () => {
      if (raf) cancelAnimationFrame(raf);
      el.classList.remove("tilt-active");
      el.style.setProperty("--tilt-x", "0deg");
      el.style.setProperty("--tilt-y", "0deg");
    });
  }

  function varrerENovosCards(raiz) {
    raiz.querySelectorAll(SELETOR_TILT).forEach(aplicarTilt);
  }

  function iniciar() {
    varrerENovosCards(document);

    // Observa o conteúdo dinâmico (feed, busca, times) para aplicar
    // o efeito também em cards que ainda nem existiam no carregamento
    // inicial da página.
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;
          if (node.matches && node.matches(SELETOR_TILT)) {
            aplicarTilt(node);
          }
          if (node.querySelectorAll) {
            varrerENovosCards(node);
          }
        });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
