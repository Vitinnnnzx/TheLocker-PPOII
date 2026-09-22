const msgsContainer = document.getElementById('chat-messages');
const inputEl = document.getElementById('chat-input');
const form = document.getElementById('chat-form');
const typingEl = document.getElementById('typing-indicator');

init();

async function init() {
  await montarShell("clibs");
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const texto = inputEl.value.trim();
    if (!texto) return;
    
    // Adiciona a mensagem do utilizador
    adicionarMensagem(texto, 'user');
    inputEl.value = '';
    
    // Simula a resposta do bot
    simularRespostaCLIBS();
  });
}

function adicionarMensagem(texto, remetente) {
  const row = document.createElement('div');
  row.className = `msg-row ${remetente}`;
  row.innerHTML = `<div class="msg-bubble">${escapeHTML(texto)}</div>`;
  msgsContainer.appendChild(row);
  scrollToBottom();
}

function simularRespostaCLIBS() {
  typingEl.style.display = 'block';
  scrollToBottom();
  
  // Atraso de 1.5s para simular o processamento da IA
  setTimeout(() => {
    typingEl.style.display = 'none';
    
    const respostas = [
      "Interessante! Lembre-se que esta interface está apenas preparada no frontend para futura integração de IA.",
      "Como modelo simulado, ainda não tenho acesso a uma API externa. Mas o meu design já está finalizado!",
      "Boa pergunta. No futuro, poderei analisar as suas métricas desportivas e sugerir treinos aqui mesmo.",
      "Recebido. A arquitetura de comunicação está isolada para que o desenvolvedor possa ligar-me a um LLM mais tarde."
    ];
    
    const respostaAleatoria = respostas[Math.floor(Math.random() * respostas.length)];
    adicionarMensagem(respostaAleatoria, 'bot');
  }, 1500);
}

function scrollToBottom() {
  msgsContainer.scrollTop = msgsContainer.scrollHeight;
}