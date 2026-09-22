const contactList = document.getElementById('contact-list');
const messagesArea = document.getElementById('direct-messages');
const headerArea = document.getElementById('chat-active-header');
const chatForm = document.getElementById('direct-chat-form');
const chatInput = document.getElementById('direct-chat-input');

// Dados simulados para estruturar o frontend
const conversasMock = [
  { id: 1, nome: "Carlos Recrutador", tipo: "recrutador", ultimaMsg: "Vi o teu vídeo de highlights!", tempo: "10 min" },
  { id: 2, nome: "Treinador Silva", tipo: "time", ultimaMsg: "Estás disponível para testes?", tempo: "1 h" }
];

init();

async function init() {
  await montarShell("chat");
  renderContactos();

  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const texto = chatInput.value.trim();
    if (!texto) return;
    
    adicionarMensagem(texto, 'user');
    chatInput.value = '';
  });
}

function renderContactos() {
  contactList.innerHTML = conversasMock.map(c => `
    <div class="contact-item" onclick="abrirConversa(${c.id}, '${escapeHTML(c.nome)}', '${c.tipo}')">
      ${avatarHTML(c.nome, null, { size: "sm", team: c.tipo === 'time' })}
      <div class="contact-info">
        <div class="contact-name">${escapeHTML(c.nome)}</div>
        <div class="contact-last-msg">${escapeHTML(c.ultimaMsg)}</div>
      </div>
      <div class="contact-time">${c.tempo}</div>
    </div>
  `).join("");
}

window.abrirConversa = function(id, nome, tipo) {
  // Atualiza Cabeçalho
  headerArea.innerHTML = `
    <div style="display:flex; align-items:center; gap:10px;">
      ${avatarHTML(nome, null, { size: "sm", team: tipo === 'time' })}
      <div>
        <div style="font-weight:700; font-size:14px;">${nome}</div>
        <div style="font-size:11px; color:var(--text-dim); text-transform:capitalize;">${tipo}</div>
      </div>
    </div>
  `;
  
  // Limpa mensagens e mostra input
  messagesArea.innerHTML = `<div class="msg-row bot"><div class="msg-bubble">Início da conversa com ${nome}</div></div>`;
  chatForm.style.display = "flex";
}

function adicionarMensagem(texto, remetente) {
  const row = document.createElement('div');
  row.className = `msg-row ${remetente}`;
  row.innerHTML = `<div class="msg-bubble">${escapeHTML(texto)}</div>`;
  messagesArea.appendChild(row);
  messagesArea.scrollTop = messagesArea.scrollHeight;
}