const form = document.getElementById("time-form");
const errorBox = document.getElementById("form-error");
const successBox = document.getElementById("form-success");
const submitBtn = document.getElementById("submit-btn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorBox.classList.remove("visible");
  successBox.classList.remove("visible");
  submitBtn.disabled = true;
  submitBtn.textContent = "Cadastrando...";

  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;
  const cidade = document.getElementById("cidade").value.trim();
  const estado = document.getElementById("estado").value.trim().toUpperCase();
  const escudo = document.getElementById("escudo").value.trim();

  try {
    await API.criarTime({
      nome,
      email,
      senha,
      cidade: cidade || null,
      estado: estado || null,
      escudo: escudo || null,
    });
    successBox.textContent = "Time cadastrado! Redirecionando para o login...";
    successBox.classList.add("visible");
    setTimeout(() => { window.location.href = "/login"; }, 1200);
  } catch (err) {
    errorBox.textContent = err.message || "Não foi possível cadastrar o time.";
    errorBox.classList.add("visible");
    submitBtn.disabled = false;
    submitBtn.textContent = "Cadastrar time";
  }
});
