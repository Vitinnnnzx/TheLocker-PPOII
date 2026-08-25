// dom-utils.js
// Pequenas funções utilitárias usadas em várias partes do projeto.
// Nenhuma lógica de negócio deve morar aqui, apenas ajudantes de DOM/formatação.

/** Atalho para document.querySelector */
export function qs(selector, scope = document) {
    return scope.querySelector(selector);
}

/** Atalho para document.querySelectorAll, já devolvendo um array */
export function qsa(selector, scope = document) {
    return Array.from(scope.querySelectorAll(selector));
}

/** Formata números grandes como "1.234" (padrão brasileiro) */
export function formatNumber(value) {
    return Number(value).toLocaleString('pt-BR');
}

/**
 * Aplica uma cor vinda dos dados como variável CSS no elemento,
 * em vez de escrever "style=" diretamente no HTML.
 * O CSS (style.css) é quem decide como essa variável é usada
 * (background, cor do texto, etc).
 */
export function setColorVar(element, cssVarName, colorValue) {
    if (element && colorValue) {
        element.style.setProperty(cssVarName, colorValue);
    }
}
