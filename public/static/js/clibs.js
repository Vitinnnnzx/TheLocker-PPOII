const msgsContainer = document.getElementById("chat-messages");
const inputEl = document.getElementById("chat-input");
const form = document.getElementById("chat-form");
const typingEl = document.getElementById("typing-indicator");

init();

async function init() {
  await montarShell("clibs");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const texto = inputEl.value.trim();
    if (!texto) return;

    // Adiciona a mensagem do utilizador
    adicionarMensagem(texto, "user");
    inputEl.value = "";

    // Simula a resposta do bot
    respostaCLIBS(texto);
  });
}

function adicionarMensagem(texto, remetente) {
  const row = document.createElement("div");
  row.className = `msg-row ${remetente}`;
  row.innerHTML = `<div class="msg-bubble">${escapeHTML(texto)}</div>`;
  msgsContainer.appendChild(row);
  scrollToBottom();
}

async function respostaCLIBS(user_message) {
  typingEl.style.display = "block";
  scrollToBottom();
  typingEl.style.display = "none";

  try {
    const response = await fetch("/pergunta", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mensagem: user_message,
      }),
    });

    const dados = await response.json();

    if (!response.ok) {
      console.error(dados.erro);
      adicionarMensagem(
        "CLIBS não conseguiu responder. Tente novamente",
        "bot",
      );
      return;
    }
    console.log(dados);
    console.log(dados.resposta);
    adicionarMensagem(dados.resposta, "bot");
  } catch (erro) {
    console.error("Erro ao enviar pergunta:", erro);
    adicionarMensagem("CLIBS não conseguiu responder", "bot");
  }
}

function scrollToBottom() {
  msgsContainer.scrollTop = msgsContainer.scrollHeight;
}
