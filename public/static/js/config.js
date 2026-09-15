const form = document.getElementById("config-form");
const errorBox = document.getElementById("form-error");
const successBox = document.getElementById("form-success");
const submitBtn = document.getElementById("submit-btn");
const camposAtleta = document.getElementById("campos-atleta");

init();

async function init() {
  const usuario = await montarShell("config");
  if (!usuario) return;

  document.getElementById("nome").value = usuario.nome || "";
  document.getElementById("email").value = usuario.email || "";

  if (usuario.tipo === "atleta") {
    camposAtleta.style.display = "block";
    try {
      const dados = await API.perfilDados();
      document.getElementById("bio").value = dados.bio || "";
      document.getElementById("modalidade").value = dados.modalidade || "";
      document.getElementById("posicao").value = dados.posicao || "";
      document.getElementById("cidade").value = dados.cidade || "";
      document.getElementById("estado").value = dados.estado || "";
      document.getElementById("foto").value = dados.foto || "";
      if (dados.data_nascimento) {
        document.getElementById("data_nascimento").value = String(dados.data_nascimento).slice(0, 10);
      }
    } catch (e) { /* segue com os campos vazios */ }
  }

  form.addEventListener("submit", salvar);
}

async function salvar(e) {
  e.preventDefault();
  errorBox.classList.remove("visible");
  successBox.classList.remove("visible");
  submitBtn.disabled = true;
  submitBtn.textContent = "Salvando...";

  const payload = {
    nome: document.getElementById("nome").value.trim() || null,
    email: document.getElementById("email").value.trim() || null,
  };

  const senha = document.getElementById("senha").value;
  if (senha) payload.senha = senha;

  if (camposAtleta.style.display !== "none") {
    payload.bio = document.getElementById("bio").value.trim() || null;
    payload.modalidade = document.getElementById("modalidade").value.trim() || null;
    payload.posicao = document.getElementById("posicao").value.trim() || null;
    payload.cidade = document.getElementById("cidade").value.trim() || null;
    payload.estado = document.getElementById("estado").value.trim().toUpperCase() || null;
    payload.foto = document.getElementById("foto").value.trim() || null;
    payload.data_nascimento = document.getElementById("data_nascimento").value || null;
  }

  try {
    await API.atualizarPerfil(payload);
    successBox.textContent = "Perfil atualizado com sucesso!";
    successBox.classList.add("visible");
    document.getElementById("senha").value = "";
  } catch (err) {
    errorBox.textContent = err.message || "Não foi possível salvar.";
    errorBox.classList.add("visible");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Salvar alterações";
  }
}
