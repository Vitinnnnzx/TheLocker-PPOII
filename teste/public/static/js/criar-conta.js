const form = document.getElementById("cadastro-form");
const errorBox = document.getElementById("form-error");
const successBox = document.getElementById("form-success");
const submitBtn = document.getElementById("submit-btn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorBox.classList.remove("visible");
  successBox.classList.remove("visible");
  submitBtn.disabled = true;
  submitBtn.textContent = "Criando...";

  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;
  const tipo = form.querySelector('input[name="tipo"]:checked').value;

  try {
    await API.criarConta({ nome, email, senha, tipo });
    successBox.textContent = "Conta criada! Redirecionando para o login...";
    successBox.classList.add("visible");
    setTimeout(() => { window.location.href = "/login"; }, 1200);
  } catch (err) {
    errorBox.textContent = err.message || "Não foi possível criar a conta.";
    errorBox.classList.add("visible");
    submitBtn.disabled = false;
    submitBtn.textContent = "Criar conta";
  }
});
