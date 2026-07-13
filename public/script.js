// Função para expandir a área de composição de post
function expandCompose(textarea) {
    const actions = document.getElementById('compose-actions');
    textarea.rows = 3;
    actions.classList.remove('hidden');
}

// Função para encolher a área de composição de post
function shrinkCompose() {
    const textarea = document.querySelector('.compose-textarea');
    const actions = document.getElementById('compose-actions');
    textarea.value = '';
    textarea.rows = 1;
    actions.classList.add('hidden');
}

// Função para alternar o estado de "Curtir"
function toggleLike(button) {
    const isLiked = button.classList.contains('liked');
    const span = button.querySelector('span');
    let count = parseInt(span.innerText);

    if (isLiked) {
        button.classList.remove('liked');
        span.innerText = count - 1;
        button.querySelector('svg').setAttribute('fill', 'none');
    } else {
        button.classList.add('liked');
        span.innerText = count + 1;
        button.querySelector('svg').setAttribute('fill', '#FF4D4D');
    }
}

// Função para alternar o estado de "Salvar"
function toggleSave(button) {
    const isSaved = button.classList.contains('saved');

    if (isSaved) {
        button.classList.remove('saved');
        button.querySelector('svg').setAttribute('fill', 'none');
    } else {
        button.classList.add('saved');
        button.querySelector('svg').setAttribute('fill', '#C8FF00');
    }
}

// Função para alternar o estado de "Seguir"
function toggleFollow(button) {
    const isFollowing = button.classList.contains('following');

    if (isFollowing) {
        button.classList.remove('following');
        button.innerText = 'Seguir';
    } else {
        button.classList.add('following');
        button.innerText = 'Seguindo';
    }
}

// Função para mudar a aba ativa na Sidebar
function setActive(button) {
    // Remove a classe active de todos os itens
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    // Adiciona ao item clicado
    button.classList.add('active');
}

// Função para mudar a aba ativa no Feed
document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
    });
});
