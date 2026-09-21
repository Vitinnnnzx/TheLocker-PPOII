const form = document.getElementById("login-form");
const errorBox = document.getElementById("form-error");
const submitBtn = document.getElementById("submit-btn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorBox.classList.remove("visible");
  submitBtn.disabled = true;
  submitBtn.textContent = "Entrando...";

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;

  try {
    await API.login({ email, senha });
    window.location.href = "/";
  } catch (err) {
    errorBox.textContent = err.message || "Não foi possível entrar.";
    errorBox.classList.add("visible");
    submitBtn.disabled = false;
    submitBtn.textContent = "Entrar";
  }
});

// Se já estiver logado, pula direto pro feed.
API.usuarioAtual().then(() => {
  window.location.href = "/";
}).catch(() => {});
